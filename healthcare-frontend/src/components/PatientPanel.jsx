import React, { useState, useEffect } from 'react';
import { patientService, appointmentService, prescriptionService, userService } from '../services/api';
import FeedbackModal from './FeedbackModal';
import '../styles/PatientPanel.css';

const PatientPanel = () => {
  const [patientId, setPatientId] = useState(localStorage.getItem('patientId') || '');
  const [identityNumber, setIdentityNumber] = useState(localStorage.getItem('patientIdentityNumber') || '');
  const [password, setPassword] = useState('');
  const [identityNumberError, setIdentityNumberError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('patientId') ? true : false);

  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // profile, appointments, prescriptions

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feedback modal
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, appointmentId: null, doctorId: null });

  // Load data on mount
  useEffect(() => {
    if (isLoggedIn && patientId) {
      fetchPatientData();
      fetchAppointments();
      fetchPrescriptions();
    }
  }, [isLoggedIn, patientId]);

  const handlePatientLogin = async () => {
    const tcknRegex = /^\d{11}$/;
    if (!identityNumber || !tcknRegex.test(identityNumber)) {
      setIdentityNumberError('T.C. Kimlik Numarası tam olarak 11 rakamdan oluşmalıdır.');
      return;
    }
    if (!password) {
      setError('Lütfen şifrenizi giriniz.');
      return;
    }
    setIdentityNumberError('');

    try {
      const response = await userService.login(identityNumber, password);
      if (response.data.success) {
        const userData = response.data.data.user;
        localStorage.setItem('patientId', userData.id);
        localStorage.setItem('patientIdentityNumber', identityNumber);
        localStorage.setItem('jwtToken', response.data.data.token);
        setPatientId(userData.id);
        setIsLoggedIn(true);
        setError('');
      } else {
        setError(response.data.message || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setError('Giriş yapılırken hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatientById(patientId);
      if (response.data.success) {
        setPatientData(response.data.data);
      }
    } catch (err) {
      setError('Hasta verisi yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getPatientAppointments(patientId);
      if (response.data.success) {
        const sorted = response.data.data.sort((a, b) => 
          new Date(b.dateTime) - new Date(a.dateTime)
        );
        setAppointments(sorted);
      }
    } catch (err) {
      console.error('Randevu yükleme hatası:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionService.getPatientPrescriptions(patientId);
      if (response.data.success) {
        const sorted = response.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPrescriptions(sorted);
      }
    } catch (err) {
      console.error('Reçete yükleme hatası:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientIdentityNumber');
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    setPatientId('');
    setIdentityNumber('');
    setPassword('');
    setPatientData(null);
    setAppointments([]);
    setPrescriptions([]);
    setActiveTab('profile');
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="patient-panel">
        <h1>🏥 Hasta Paneli</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="login-container">
          <div className="login-box">
            <h2>Hasta Girişi</h2>

            <div className="form-group">
              <label htmlFor="identityNumber">T.C. Kimlik Numarası:</label>
              <input
                id="identityNumber"
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={identityNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setIdentityNumber(val);
                  setIdentityNumberError('');
                }}
                placeholder="11 haneli T.C. Kimlik No"
              />
              {identityNumberError && (
                <span className="field-error">{identityNumberError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Şifre:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi giriniz"
              />
            </div>

            <button className="btn btn-primary" onClick={handlePatientLogin}>
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="patient-panel">
      <div className="patient-header">
        <h1>🏥 Hasta Paneli</h1>
        <div className="patient-info">
          <span>{identityNumber || 'Hasta'}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profilim
        </button>
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📋 Randevularım ({appointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          💊 Reçetelerim ({prescriptions.length})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="tab-content">
          <div className="profile-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Yükleniyor...
              </div>
            ) : patientData ? (
              <div className="profile-box">
                <h2>👤 Kişisel Bilgilerim</h2>
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>T.C. Kimlik No:</label>
                    <value>{patientData.identityNumber || '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Email:</label>
                    <value>{patientData.email || '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Telefon:</label>
                    <value>{patientData.phoneNumber || '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Kan Grubu:</label>
                    <value>{patientData.bloodType || '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Boy:</label>
                    <value>{patientData.height ? `${patientData.height} cm` : '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Kilo:</label>
                    <value>{patientData.weight ? `${patientData.weight} kg` : '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>Doğum Tarihi:</label>
                    <value>{patientData.birthDate || '-'}</value>
                  </div>
                  <div className="profile-item">
                    <label>BMI:</label>
                    <value>
                      {patientData.height && patientData.weight
                        ? (patientData.weight / (patientData.height / 100) ** 2).toFixed(1)
                        : '-'}
                    </value>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>Profil verisi yüklenemedi.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Yükleniyor...
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>Henüz randevu almadınız.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className={`appointment-item status-${apt.status.toLowerCase()}`}>
                  <div className="appointment-header">
                    <div className="appointment-time">⏰ {formatDateTime(apt.dateTime)}</div>
                    <div className={`appointment-status status-badge`}>
                      {apt.status === 'PENDING'
                        ? '⏳ Beklemede'
                        : apt.status === 'COMPLETED'
                        ? '✅ Tamamlandı'
                        : apt.status === 'CANCELLED_BY_PATIENT'
                        ? '❌ İptal (Hasta)'
                        : '❌ İptal (Doktor)'}
                    </div>
                  </div>
                  <div className="appointment-body">
                    <div className="appointment-detail">
                      <label>Doktor:</label>
                      <span>{apt.doctor?.email || 'Bilinmiyor'}</span>
                    </div>
                    {apt.notes && (
                      <div className="appointment-detail">
                        <label>Notlar:</label>
                        <span className="notes">{apt.notes}</span>
                      </div>
                    )}
                  </div>
                  {apt.status === 'COMPLETED' && (
                    <div className="appointment-footer">
                      <button 
                        className="btn btn-small btn-primary"
                        onClick={() => setFeedbackModal({ isOpen: true, appointmentId: apt.id, doctorId: apt.doctor?.id })}
                      >
                        ⭐ Değerlendir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Yükleniyor...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <p>Henüz reçete almadınız.</p>
            </div>
          ) : (
            <div className="prescriptions-list">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-item">
                  <div className="prescription-header">
                    <div className="prescription-date">📅 {formatDate(prescription.createdAt)}</div>
                    <div className="prescription-doctor">👨‍⚕️ {prescription.appointment?.doctor?.email || 'Bilinmiyor'}</div>
                  </div>
                  <div className="prescription-body">
                    <div className="medicine-section">
                      <h4>💊 İlaçlar</h4>
                      <div className="medicine-content">
                        {prescription.medicineList}
                      </div>
                    </div>
                    <div className="dosage-section">
                      <h4>📝 Dozaj Talimatları</h4>
                      <div className="dosage-content">
                        {prescription.dosage}
                      </div>
                    </div>
                  </div>
                  <div className="prescription-footer">
                    <button className="btn btn-small btn-primary">
                      🖨️ Yazdır
                    </button>
                    <button className="btn btn-small btn-secondary">
                      📱 Paylaş
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <FeedbackModal
          appointmentId={feedbackModal.appointmentId}
          patientId={patientId}
          doctorId={feedbackModal.doctorId}
          onClose={() => setFeedbackModal({ isOpen: false, appointmentId: null, doctorId: null })}
          onSubmitSuccess={() => {
            setFeedbackModal({ isOpen: false, appointmentId: null, doctorId: null });
            alert('✅ Değerlendirmeniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.');
          }}
        />
      )}
    </div>
  );
};

export default PatientPanel;

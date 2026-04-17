import React, { useState, useEffect } from 'react';
import { appointmentService, patientService, prescriptionService, userService } from '../services/api';
import '../styles/DoctorPanel.css';

const DoctorPanel = () => {
  const [doctorId, setDoctorId] = useState(localStorage.getItem('doctorId') || '');
  const [identityNumber, setIdentityNumber] = useState(localStorage.getItem('doctorIdentityNumber') || '');
  const [password, setPassword] = useState('');
  const [identityNumberError, setIdentityNumberError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('doctorId') ? true : false);

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  
  const [medicineList, setMedicineList] = useState('');
  const [dosage, setDosage] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('appointments'); // appointments or prescription

  // Load today's appointments on mount
  useEffect(() => {
    if (isLoggedIn && doctorId) {
      fetchTodayAppointments();
    }
  }, [isLoggedIn, doctorId]);

  const handleDoctorLogin = async () => {
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
        localStorage.setItem('doctorId', userData.id);
        localStorage.setItem('doctorIdentityNumber', identityNumber);
        localStorage.setItem('jwtToken', response.data.data.token);
        setDoctorId(userData.id);
        setIsLoggedIn(true);
        setError('');
        fetchTodayAppointments();
      } else {
        setError(response.data.message || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setError('Giriş yapılırken hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getPatientAppointments(doctorId);
      
      // Filter to get today's appointments based on date
      const today = new Date().toDateString();
      const todayAppointments = response.data.data.filter(apt => {
        return new Date(apt.dateTime).toDateString() === today && 
               (apt.status === 'PENDING' || apt.status === 'COMPLETED');
      });
      
      setAppointments(todayAppointments);
      setError('');
    } catch (err) {
      setError('Randevuları yüklerken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppointment = async (appointment) => {
    setSelectedAppointment(appointment);
    setPatientProfile(null);
    setMedicineList('');
    setDosage('');
    setDoctorNotes('');
    setView('appointment-details');

    try {
      setLoading(true);
      const response = await patientService.getPatientById(appointment.patient.id);
      if (response.data.success) {
        setPatientProfile(response.data.data);
      }
    } catch (err) {
      setError('Hasta profili yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (!medicineList || !dosage) {
      setError('Lütfen ilaç adı ve dozaj giriniz.');
      return;
    }

    if (!selectedAppointment) {
      setError('Lütfen bir randevu seçiniz.');
      return;
    }

    try {
      setLoading(true);
      const prescriptionData = {
        appointmentId: selectedAppointment.id,
        medicineList: medicineList,
        dosage: dosage
      };

      const response = await prescriptionService.createPrescription({
        appointmentId: selectedAppointment.id,
        medicineList: medicineList,
        dosage: dosage
      });

      // Manually call POST endpoint since createPrescription might not exist
      if (!response.data.success) {
        setError(response.data.message || 'Reçete oluşturulamadı.');
        return;
      }

      setSuccess('✅ Reçete başarıyla oluşturuldu ve randevu tamamlandı!');
      setMedicineList('');
      setDosage('');
      setDoctorNotes('');
      setSelectedAppointment(null);
      setPatientProfile(null);
      setView('appointments');
      
      // Refresh appointments
      setTimeout(() => {
        fetchTodayAppointments();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Reçete oluşturulurken hata: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorIdentityNumber');
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    setDoctorId('');
    setIdentityNumber('');
    setPassword('');
    setAppointments([]);
    setSelectedAppointment(null);
    setPatientProfile(null);
    setView('appointments');
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

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="doctor-panel">
        <h1>👨‍⚕️ Doktor Paneli</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="login-container">
          <div className="login-box">
            <h2>Doktor Girişi</h2>
            
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

            <button className="btn btn-primary" onClick={handleDoctorLogin}>
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="doctor-panel">
      <div className="doctor-header">
        <h1>👨‍⚕️ Doktor Paneli</h1>
        <div className="doctor-info">
          <span>{doctorEmail}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* View Selection Tabs */}
      <div className="view-tabs">
        <button
          className={`tab ${view === 'appointments' ? 'active' : ''}`}
          onClick={() => setView('appointments')}
        >
          📋 Bugünün Randevuları ({appointments.length})
        </button>
      </div>

      {/* Appointments List View */}
      {view === 'appointments' && (
        <div className="appointments-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Yükleniyor...
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>Bugün için randevu bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`appointment-card ${selectedAppointment?.id === apt.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAppointment(apt)}
                >
                  <div className="appointment-time">⏰ {formatDateTime(apt.dateTime)}</div>
                  <div className="appointment-patient">👤 {apt.patient.email}</div>
                  <div className={`appointment-status status-${apt.status.toLowerCase()}`}>
                    {apt.status === 'PENDING' ? '⏳ Bekleniyor' : '✅ Tamamlandı'}
                  </div>
                  {apt.notes && <div className="appointment-notes">📝 {apt.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointment Details & Prescription Form */}
      {view === 'appointment-details' && selectedAppointment && (
        <div className="appointment-details-section">
          <button className="btn btn-back" onClick={() => setView('appointments')}>
            ← Randevular
          </button>

          <div className="details-container">
            {/* Patient Profile */}
            <div className="patient-profile-box">
              <h2>👤 Hasta Bilgileri</h2>
              {loading ? (
                <div className="loading">Yükleniyor...</div>
              ) : patientProfile ? (
                <div className="profile-info">
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{patientProfile.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Kan Grubu:</label>
                    <span>{patientProfile.bloodType || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Boy:</label>
                    <span>{patientProfile.height ? `${patientProfile.height} cm` : '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Kilo:</label>
                    <span>{patientProfile.weight ? `${patientProfile.weight} kg` : '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Doğum Tarihi:</label>
                    <span>{patientProfile.birthDate || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>BMI:</label>
                    <span>
                      {patientProfile.height && patientProfile.weight
                        ? (patientProfile.weight / (patientProfile.height / 100 ** 2)).toFixed(1)
                        : '-'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">Hasta profili yüklenemedi.</div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="appointment-info-box">
              <h2>📅 Randevu Bilgileri</h2>
              <div className="info-item">
                <label>Saat:</label>
                <span>{formatDateTime(selectedAppointment.dateTime)}</span>
              </div>
              <div className="info-item">
                <label>Durum:</label>
                <span className={`status-badge status-${selectedAppointment.status.toLowerCase()}`}>
                  {selectedAppointment.status === 'PENDING' ? '⏳ Bekleniyor' : '✅ Tamamlandı'}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="info-item">
                  <label>Hasta Notları:</label>
                  <span className="notes">{selectedAppointment.notes}</span>
                </div>
              )}
            </div>

            {/* Prescription Form */}
            {selectedAppointment.status === 'PENDING' && (
              <div className="prescription-form-box">
                <h2>💊 Dijital Reçete Formu</h2>

                <div className="form-group">
                  <label htmlFor="medicineList">İlaç Adı / Listesi:</label>
                  <textarea
                    id="medicineList"
                    value={medicineList}
                    onChange={(e) => setMedicineList(e.target.value)}
                    placeholder="Örn: Aspirin, Antibiyotik..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="dosage">Dozaj (Talimatları):</label>
                  <textarea
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Örn: Günde 3 kez, 1 tablet, yemekten sonra..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="doctorNotes">Doktor Notları (Opsiyonel):</label>
                  <textarea
                    id="doctorNotes"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="İlave talimatlar..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleCreatePrescription}
                    disabled={loading || !medicineList || !dosage}
                  >
                    {loading ? 'İşleniyor...' : '✅ Reçeteyi Kaydet'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setView('appointments')}
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}

            {selectedAppointment.status === 'COMPLETED' && (
              <div className="completion-message">
                <h3>✅ Bu Randevu Tamamlanmıştır</h3>
                <p>Reçete zaten oluşturulmuş.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPanel;

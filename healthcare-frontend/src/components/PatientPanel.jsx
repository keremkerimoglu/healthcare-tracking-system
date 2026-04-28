import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  patientService, 
  appointmentService, 
  prescriptionService,
  departmentService,
  doctorService,
  getDoctorAppointments
} from '../services/api';
import FeedbackModal from './FeedbackModal';
import '../styles/PatientPanel.css';

const PatientPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary'); 
  
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookingData, setBookingData] = useState({ dept: null, doc: null, date: '', time: '', notes: '' });

  const [profileForm, setProfileForm] = useState({ height: '', weight: '', bloodType: '', chronicDiseases: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, appointmentId: null, doctorId: null });

  useEffect(() => {
    const id = localStorage.getItem('patientId');
    if (!id) navigate('/login');
    else fetchData(id);
  }, [navigate]);

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const pRes = await patientService.getPatientById(id);
      if (pRes.data?.data) {
        setPatientData(pRes.data.data);
        setProfileForm({
          height: pRes.data.data.height || '', weight: pRes.data.data.weight || '',
          bloodType: pRes.data.data.bloodType || '', chronicDiseases: pRes.data.data.chronicDiseases || ''
        });
      }
      
      const deptRes = await departmentService.getAllDepartments();
      setDepartments(deptRes.data?.data || []);

      const aRes = await appointmentService.getPatientAppointments(id);
      setAppointments(aRes.data?.data || []);

      const rRes = await prescriptionService.getPatientPrescriptions(id);
      setPrescriptions(rRes.data?.data || []);

    } catch (err) { console.error("Veriler çekilirken hata oluştu", err); }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const formattedData = {
        height: profileForm.height ? parseFloat(profileForm.height) : null,
        weight: profileForm.weight ? parseFloat(profileForm.weight) : null,
        bloodType: profileForm.bloodType, chronicDiseases: profileForm.chronicDiseases
      };
      const res = await patientService.updateProfile(patientData.id, formattedData);
      if (res.status === 200) {
        setUpdateMsg({ text: "✅ Bilgiler başarıyla güncellendi.", type: 'success' });
        fetchData(patientData.id); 
        setTimeout(() => setUpdateMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) { setUpdateMsg({ text: "❌ Güncelleme başarısız.", type: 'error' }); } 
    finally { setIsUpdating(false); }
  };

  const handleDeptSelect = async (deptId) => {
    if(!deptId) {
       setBookingData({ dept: null, doc: null, date: '', time: '', notes: '' });
       setDoctors([]);
       return;
    }
    const selectedDept = departments.find(d => d.id === parseInt(deptId));
    setBookingData({ ...bookingData, dept: selectedDept, doc: null, date: '', time: '' });
    
    try {
      const dRes = await doctorService.getDoctorsByDepartment(deptId);
      setDoctors(dRes.data?.data || []);
    } catch (err) { setDoctors([]); }
  };

  const handleDateChange = async (date) => {
    setBookingData({ ...bookingData, date, time: '' });
    if (!date || !bookingData.doc) {
      setTimeSlots([]);
      return;
    }

    try {
      const allSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
      ];

      const res = await getDoctorAppointments(bookingData.doc.id);
      const doctorAppointments = res.data?.data || [];

      const bookedTimes = doctorAppointments
        .filter(apt => apt.dateTime.startsWith(date) && apt.status !== 'CANCELLED')
        .map(apt => apt.dateTime.split('T')[1].substring(0, 5));

      let availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      if (date === todayStr) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        availableSlots = availableSlots.filter(slot => {
          const [h, m] = slot.split(':').map(Number);
          return h > currentHour || (h === currentHour && m > currentMinute);
        });
      }

      setTimeSlots(availableSlots);

    } catch (err) {
      console.error("Saatler hesaplanamadı:", err);
      setTimeSlots([]);
    }
  };

  const submitAppointment = async () => {
    try {
      const dateTimeStr = `${bookingData.date}T${bookingData.time}:00`;

      await appointmentService.bookAppointment({
        doctorId: bookingData.doc.id,         
        patientId: patientData.id,            
        doctor: { id: bookingData.doc.id },   
        patient: { id: patientData.id },      
        dateTime: dateTimeStr, 
        notes: bookingData.notes
      });
      
      alert("✅ Randevunuz başarıyla oluşturuldu!");
      setBookingData({ dept: null, doc: null, date: '', time: '', notes: '' });
      fetchData(patientData.id); 
      setActiveTab('appointments'); 
    } catch (err) { 
      alert("❌ Randevu alınırken hata oluştu."); 
    }
  };

  const getFullName = () => {
     if (patientData?.firstName && patientData?.lastName) return `${patientData.firstName} ${patientData.lastName}`;
     return patientData?.email || 'Yükleniyor...';
  };

  return (
    <div className="patient-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">MHRS+</div>
          <div className="sidebar-subtitle">Vatandaş Portalı</div>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><i>🏠</i> Özet</div>
          <div className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}><i>🗓️</i> Randevu Al</div>
          <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><i>📋</i> Randevularım</div>
          <div className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}><i>💊</i> Reçetelerim</div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><i>👤</i> Profilim</div>
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ color: '#e74c3c' }}><i>🚪</i> Güvenli Çıkış</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="user-profile-summary">
            <div className="user-identity">T.C. {patientData?.identityNumber || '...'}</div>
            <div className="avatar-circle">{patientData?.email ? patientData.email.charAt(0).toUpperCase() : 'V'}</div>
          </div>
        </header>

        <div className="content-wrapper">
          {loading && !patientData ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#2ecc71', fontSize: '20px', fontWeight: 'bold' }}>Sistem Verileri Yükleniyor...</div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="glass-card" style={{ maxWidth: '600px' }}>
                  <h2>⚖️ Sağlık Verileri Özeti</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><strong style={{ color: '#7f8c8d' }}>Boy:</strong> <span>{patientData?.height ? `${patientData.height} cm` : 'Girilecek'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><strong style={{ color: '#7f8c8d' }}>Kilo:</strong> <span>{patientData?.weight ? `${patientData.weight} kg` : 'Girilecek'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><strong style={{ color: '#7f8c8d' }}>Kan Grubu:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{patientData?.bloodType || 'Belirtilmemiş'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: '#7f8c8d' }}>Vücut Kitle İndeksi (VKİ):</strong> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{patientData?.height && patientData?.weight ? (patientData.weight / (patientData.height/100)**2).toFixed(1) : '-'}</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="glass-card" style={{ maxWidth: '800px' }}>
                  <h2>🗓️ Yeni Randevu Al</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group">
                      <label className="form-label">1. Poliklinik (Bölüm)</label>
                      <select className="modern-input" value={bookingData.dept?.id || ''} onChange={(e) => handleDeptSelect(e.target.value)}>
                        <option value="">Seçiniz...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    {bookingData.dept && (
                      <div className="form-group">
                        <label className="form-label">2. Hekim</label>
                        <select className="modern-input" value={bookingData.doc?.id || ''} onChange={(e) => setBookingData({...bookingData, doc: doctors.find(doc => doc.id === parseInt(e.target.value))})}>
                          <option value="">Seçiniz...</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>{d.email?.split('@')[0].toUpperCase()} ({d.specialization})</option>)}
                        </select>
                      </div>
                    )}

                    {bookingData.doc && (
                      <div className="form-group">
                        <label className="form-label">3. Tarih</label>
                        <input type="date" className="modern-input" value={bookingData.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => handleDateChange(e.target.value)} />
                        
                        {bookingData.date && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
                            {timeSlots.length > 0 ? timeSlots.map((slot, i) => (
                              <button key={i} onClick={() => setBookingData({...bookingData, time: slot})} style={{ padding: '12px', border: bookingData.time === slot ? 'none' : '1px solid #ddd', borderRadius: '8px', background: bookingData.time === slot ? '#2ecc71' : 'white', color: bookingData.time === slot ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                                {slot}
                              </button>
                            )) : (
                              <p style={{ color: '#e74c3c', gridColumn: '1 / -1', fontWeight: 'bold' }}>Bu tarihte uygun saat bulunmamaktadır veya mesai bitmiştir.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {bookingData.time && (
                      <div className="form-group">
                        <label className="form-label">4. Şikayetiniz / Notunuz (İsteğe Bağlı)</label>
                        <textarea className="modern-input" placeholder="Doktora iletmek istediğiniz not..." value={bookingData.notes} onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} />
                        <button className="btn-modern-green" onClick={submitAppointment} style={{ marginTop: '20px' }}>Randevuyu Onayla</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="glass-card" style={{ maxWidth: '700px' }}>
                  <h2>👤 Profilim & Sağlık Bilgilerim</h2>
                  {updateMsg.text && <div className={`alert-box ${updateMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{updateMsg.text}</div>}
                  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e9ecef' }}>
                    <h3 style={{ fontSize: '16px', color: '#34495e', marginTop: 0, borderBottom: 'none', paddingBottom: 0 }}>Kimlik Bilgileri (Salt Okunur)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div><label className="form-label" style={{ fontSize: '12px' }}>T.C. Kimlik No</label><div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{patientData?.identityNumber}</div></div>
                      <div><label className="form-label" style={{ fontSize: '12px' }}>İsim Soyisim / Email</label><div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{getFullName()}</div></div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Boy (cm)</label><input type="number" name="height" className="modern-input" value={profileForm.height} onChange={(e) => setProfileForm({...profileForm, height: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Kilo (kg)</label><input type="number" name="weight" className="modern-input" value={profileForm.weight} onChange={(e) => setProfileForm({...profileForm, weight: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Kan Grubu</label><input type="text" name="bloodType" className="modern-input" value={profileForm.bloodType} onChange={(e) => setProfileForm({...profileForm, bloodType: e.target.value})} /></div>
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}><label className="form-label">Kronik Hastalıklar veya Sürekli Kullanılan İlaçlar</label><textarea name="chronicDiseases" className="modern-input" value={profileForm.chronicDiseases} onChange={(e) => setProfileForm({...profileForm, chronicDiseases: e.target.value})} /></div>
                    <div style={{ marginTop: '25px', textAlign: 'right' }}><button type="submit" className="btn-modern-green" disabled={isUpdating}>{isUpdating ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}</button></div>
                  </form>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="glass-card">
                  <h2>📋 Randevu Geçmişim</h2>
                  {appointments.length === 0 ? <p>Randevunuz bulunmuyor.</p> : appointments.map(a => (
                    <div key={a.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>Dr. {a.doctor?.email?.split('@')[0]}</div><div style={{ fontSize: '14px', color: '#7f8c8d' }}>{new Date(a.dateTime).toLocaleString('tr-TR')}</div></div>
                      <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: a.status === 'PENDING' ? '#fff3cd' : '#d4edda', color: a.status === 'PENDING' ? '#856404' : '#155724' }}>{a.status === 'PENDING' ? '⏳ Bekliyor' : '✅ Tamamlandı'}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 🔥 EKLENEN REÇETELERİM SEKME KODU */}
              {activeTab === 'prescriptions' && (
                <div className="glass-card">
                  <h2>💊 Reçetelerim</h2>
                  {prescriptions.length === 0 ? (
                    <p style={{ color: '#7f8c8d' }}>Sistemde kayıtlı reçeteniz bulunmamaktadır.</p>
                  ) : (
                    prescriptions.map(prec => (
                      <div key={prec.id} style={{ padding: '20px', border: '1px solid #e1e8ed', borderRadius: '10px', marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                          <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>
                            Dr. {prec.appointment?.doctor?.email?.split('@')[0] || 'Bilinmiyor'}
                          </div>
                          <div style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold' }}>
                            {prec.appointment?.dateTime ? new Date(prec.appointment.dateTime).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div><strong style={{ color: '#3498db' }}>İlaçlar:</strong> <span style={{ color: '#333' }}>{prec.medicineList}</span></div>
                          <div><strong style={{ color: '#e67e22' }}>Kullanım (Dozaj):</strong> <span style={{ color: '#333' }}>{prec.dosage}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientPanel;
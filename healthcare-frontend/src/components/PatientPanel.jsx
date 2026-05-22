import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk'; // Görüntülü Görüşme Paketi
import { 
  patientService, 
  appointmentService, 
  prescriptionService,
  departmentService,
  doctorService,
  getDoctorAppointments
} from '../services/api';
import { Home, Building2, Video, Calendar, Pill, User, LogOut, CheckCircle, Clock, Activity, Ruler, Scale, Droplets, Save, ClipboardList, XCircle } from 'lucide-react';
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

  // Video Konferans State'i
  const [jitsiRoom, setJitsiRoom] = useState(null);
  // İş Kuralı: Bir kez girilip çıkılan odaları tutan liste
  const [usedRooms, setUsedRooms] = useState(new Set());

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
        setUpdateMsg({ text: "Bilgiler başarıyla güncellendi.", type: 'success' });
        fetchData(patientData.id); 
        setTimeout(() => setUpdateMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) { setUpdateMsg({ text: "Güncelleme başarısız.", type: 'error' }); } 
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

      // Hem yüz yüze hem online randevular aynı tabloda olduğu için burada çakışma kontrolü otomatik yapılır!
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

      // Randevu türünü sekmeden anlıyoruz
      const appointmentType = activeTab === 'booking-online' ? 'ONLINE' : 'PHYSICAL';

      await appointmentService.bookAppointment({
        doctorId: bookingData.doc.id,         
        patientId: patientData.id,            
        doctor: { id: bookingData.doc.id },   
        patient: { id: patientData.id },      
        dateTime: dateTimeStr, 
        notes: bookingData.notes,
        appointmentType: appointmentType // Backend'e türü fırlatıyoruz!
      });
      
      alert(`${appointmentType === 'ONLINE' ? 'Online' : 'Yüz Yüze'} randevunuz başarıyla oluşturuldu!`);
      setBookingData({ dept: null, doc: null, date: '', time: '', notes: '' });
      fetchData(patientData.id); 
      setActiveTab('appointments'); 
    } catch (err) { 
      alert("Randevu alınırken hata oluştu."); 
    }
  };

  const getFullName = () => {
     if (patientData?.firstName && patientData?.lastName) return `${patientData.firstName} ${patientData.lastName}`;
     return patientData?.email || 'Yükleniyor...';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setBookingData({ dept: null, doc: null, date: '', time: '', notes: '' }); // Sekme değişince formu temizle
    setDoctors([]);
    setTimeSlots([]);
  };

  // İş Kuralı: Randevunun katılım durumunu hesaplar
  // 'expired'  → 10 dk'dan fazla geçmiş → buton kaldırılır
  // 'joinable'  → 5 dk öncesinden 10 dk sonrasına kadar → buton aktif
  // 'not-yet'   → henüz zaman gelmedi → buton pasif
  const getJoinStatus = (dateTimeStr) => {
    const now = new Date();
    const aptTime = new Date(dateTimeStr);
    const diffMinutes = (now - aptTime) / 60000; // negatif = gelecek, pozitif = geçmiş
    if (diffMinutes > 10) return 'expired';
    if (diffMinutes >= -5) return 'joinable';
    return 'not-yet';
  };

  return (
    <div className="pat-dashboard">
      {/* SIDEBAR */}
      <aside className="pat-sidebar">
        <div className="pat-sidebar-header">
          <span className="pat-logo-badge">MHRS+</span>
          <span className="pat-logo-sub">Vatandaş Portalı</span>
        </div>
        <nav className="pat-nav">
          <div className={`pat-nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => handleTabChange('summary')}>
            <Home size={18} /> <span>Özet</span>
          </div>
          <div className={`pat-nav-item ${activeTab === 'booking-physical' ? 'active' : ''}`} onClick={() => handleTabChange('booking-physical')}>
            <Building2 size={18} /> <span>Hastane Randevusu</span>
          </div>
          <div className={`pat-nav-item ${activeTab === 'booking-online' ? 'active' : ''}`} onClick={() => handleTabChange('booking-online')}>
            <Video size={18} /> <span>Online Muayene</span>
          </div>
          <div className={`pat-nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => handleTabChange('appointments')}>
            <Calendar size={18} /> <span>Randevularım</span>
          </div>
          <div className={`pat-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => handleTabChange('prescriptions')}>
            <Pill size={18} /> <span>Reçetelerim</span>
          </div>
          <div className={`pat-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
            <User size={18} /> <span>Profilim</span>
          </div>
        </nav>
        <div className="pat-sidebar-footer">
          <div className="pat-nav-item pat-logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            <LogOut size={18} /> <span>Güvenli Çıkış</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="pat-main">
        <header className="pat-header">
          <div>
            <h1 className="pat-page-title">
              {activeTab === 'summary' ? 'Sağlık Özeti' :
               activeTab === 'booking-physical' ? 'Hastane Randevusu' :
               activeTab === 'booking-online' ? 'Online Muayene' :
               activeTab === 'appointments' ? 'Randevularım' :
               activeTab === 'prescriptions' ? 'Reçetelerim' : 'Profilim'}
            </h1>
            <p className="pat-page-sub">T.C. {patientData?.identityNumber || '...'}</p>
          </div>
          <div className="pat-header-avatar">{patientData?.email?.charAt(0).toUpperCase() || 'V'}</div>
        </header>

        <div className="pat-content">
          {loading && !patientData ? (
            <div className="pat-loading">Sistem Verileri Yükleniyor...</div>
          ) : (
            <>
              {/* ÖZET */}
              {activeTab === 'summary' && (
                <div style={{ maxWidth: '720px' }}>
                  <div className="pat-kpi-grid">
                    <div className="pat-kpi-card">
                      <div className="pat-kpi-icon-wrap" style={{ background: '#ecfdf5' }}><Ruler size={20} color="#10b981" /></div>
                      <div><div className="pat-kpi-label">Boy</div><div className="pat-kpi-val">{patientData?.height ? `${patientData.height} cm` : '—'}</div></div>
                    </div>
                    <div className="pat-kpi-card">
                      <div className="pat-kpi-icon-wrap" style={{ background: '#ecfdf5' }}><Scale size={20} color="#10b981" /></div>
                      <div><div className="pat-kpi-label">Kilo</div><div className="pat-kpi-val">{patientData?.weight ? `${patientData.weight} kg` : '—'}</div></div>
                    </div>
                    <div className="pat-kpi-card">
                      <div className="pat-kpi-icon-wrap" style={{ background: '#fff1f2' }}><Droplets size={20} color="#ef4444" /></div>
                      <div><div className="pat-kpi-label">Kan Grubu</div><div className="pat-kpi-val" style={{ color: '#ef4444' }}>{patientData?.bloodType || 'Belirtilmemiş'}</div></div>
                    </div>
                    <div className="pat-kpi-card">
                      <div className="pat-kpi-icon-wrap" style={{ background: '#eff6ff' }}><Activity size={20} color="#3b82f6" /></div>
                      <div><div className="pat-kpi-label">VKİ</div><div className="pat-kpi-val" style={{ color: '#3b82f6' }}>{patientData?.height && patientData?.weight ? (patientData.weight / (patientData.height / 100) ** 2).toFixed(1) : '—'}</div></div>
                    </div>
                  </div>
                  {patientData?.chronicDiseases && (
                    <div className="pat-card" style={{ marginTop: '24px' }}>
                      <div className="pat-card-header"><h3>Kronik Hastalıklar / Sürekli İlaçlar</h3></div>
                      <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>{patientData.chronicDiseases}</p>
                    </div>
                  )}
                </div>
              )}

              {/* RANDEVU ALMA */}
              {(activeTab === 'booking-physical' || activeTab === 'booking-online') && (
                <div className="pat-card" style={{ maxWidth: '800px', borderTop: `4px solid ${activeTab === 'booking-online' ? '#6366f1' : '#10b981'}` }}>
                  <div className="pat-card-header" style={{ marginBottom: '8px' }}>
                    <h3>{activeTab === 'booking-online' ? 'Yeni Online Muayene Randevusu' : 'Yeni Hastane Randevusu'}</h3>
                    <span className={`pat-badge ${activeTab === 'booking-online' ? 'indigo' : 'green'}`}>{activeTab === 'booking-online' ? 'Online' : 'Yüz Yüze'}</span>
                  </div>
                  <p className="pat-muted" style={{ marginBottom: '24px' }}>
                    {activeTab === 'booking-online' ? 'Görüşme saati geldiğinde "Randevularım" sekmesinden kameranızı açarak hekime bağlanabilirsiniz.' : 'Randevu saatinizden 15 dakika önce poliklinik sekreterliğine kayıt yaptırınız.'}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="pat-form-group">
                      <label className="pat-label">1. Poliklinik (Bölüm)</label>
                      <select className="pat-input" value={bookingData.dept?.id || ''} onChange={(e) => handleDeptSelect(e.target.value)}>
                        <option value="">Seçiniz...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    {bookingData.dept && (
                      <div className="pat-form-group">
                        <label className="pat-label">2. Hekim</label>
                        <select className="pat-input" value={bookingData.doc?.id || ''} onChange={(e) => setBookingData({...bookingData, doc: doctors.find(doc => doc.id === parseInt(e.target.value))})}>
                          <option value="">Seçiniz...</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>{d.email?.split('@')[0].toUpperCase()} ({d.specialization})</option>)}
                        </select>
                      </div>
                    )}
                    {bookingData.doc && (
                      <div className="pat-form-group">
                        <label className="pat-label">3. Tarih</label>
                        <input type="date" className="pat-input" style={{ maxWidth: '220px' }} value={bookingData.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => handleDateChange(e.target.value)} />
                        {bookingData.date && (
                          <div className="pat-slots">
                            {timeSlots.length > 0 ? timeSlots.map((slot, i) => (
                              <button
                                key={i}
                                className={`pat-slot-btn ${bookingData.time === slot ? 'selected' : ''}`}
                                data-color={activeTab === 'booking-online' ? 'indigo' : 'green'}
                                onClick={() => setBookingData({...bookingData, time: slot})}
                              >
                                {slot}
                              </button>
                            )) : (
                              <p className="pat-no-slots">Bu tarihte uygun saat bulunmamaktadır veya mesai bitmiştir.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {bookingData.time && (
                      <div className="pat-form-group">
                        <label className="pat-label">4. Şikayetiniz / Notunuz (İsteğe Bağlı)</label>
                        <textarea className="pat-input pat-textarea" placeholder="Doktora iletmek istediğiniz ön bilgi..." value={bookingData.notes} onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} />
                        <button
                          className="pat-btn-primary"
                          onClick={submitAppointment}
                          style={{ marginTop: '16px', background: activeTab === 'booking-online' ? '#6366f1' : '#10b981' }}
                        >
                          <CheckCircle size={16} /> Randevuyu Onayla
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROFİL */}
              {activeTab === 'profile' && (
                <div className="pat-card" style={{ maxWidth: '700px' }}>
                  <div className="pat-card-header" style={{ marginBottom: '20px' }}>
                    <h3>Profilim &amp; Sağlık Bilgilerim</h3>
                  </div>
                  {updateMsg.text && (
                    <div className={`pat-alert ${updateMsg.type === 'success' ? 'success' : 'error'}`}>{updateMsg.text}</div>
                  )}
                  <div className="pat-id-box">
                    <div>
                      <div className="pat-id-label">T.C. Kimlik No</div>
                      <div className="pat-id-value">{patientData?.identityNumber}</div>
                    </div>
                    <div>
                      <div className="pat-id-label">İsim / E-posta</div>
                      <div className="pat-id-value">{getFullName()}</div>
                    </div>
                  </div>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="pat-form-grid">
                      <div className="pat-form-group">
                        <label className="pat-label">Boy (cm)</label>
                        <input type="number" className="pat-input" value={profileForm.height} onChange={(e) => setProfileForm({...profileForm, height: e.target.value})} />
                      </div>
                      <div className="pat-form-group">
                        <label className="pat-label">Kilo (kg)</label>
                        <input type="number" className="pat-input" value={profileForm.weight} onChange={(e) => setProfileForm({...profileForm, weight: e.target.value})} />
                      </div>
                      <div className="pat-form-group">
                        <label className="pat-label">Kan Grubu</label>
                        <input type="text" className="pat-input" value={profileForm.bloodType} onChange={(e) => setProfileForm({...profileForm, bloodType: e.target.value})} />
                      </div>
                    </div>
                    <div className="pat-form-group" style={{ marginTop: '16px' }}>
                      <label className="pat-label">Kronik Hastalıklar / Sürekli Kullanılan İlaçlar</label>
                      <textarea className="pat-input pat-textarea" value={profileForm.chronicDiseases} onChange={(e) => setProfileForm({...profileForm, chronicDiseases: e.target.value})} />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                      <button type="submit" className="pat-btn-primary" disabled={isUpdating}>
                        <Save size={16} /> {isUpdating ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="glass-card">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Randevu Geçmişim</h2>
                  {appointments.length === 0 ? <p>Randevunuz bulunmuyor.</p> : appointments.map(a => (
                    <div key={a.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>
                          Dr. {a.doctor?.email?.split('@')[0]}
                          {a.appointmentType === 'ONLINE' && <span style={{ marginLeft: '10px', fontSize: '12px', padding: '3px 8px', backgroundColor: '#3498db', color: 'white', borderRadius: '12px' }}>Online</span>}
                        </div>
                        <div style={{ fontSize: '14px', color: '#7f8c8d' }}>{new Date(a.dateTime).toLocaleString('tr-TR')}</div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: a.status === 'PENDING' ? '#fff3cd' : '#d4edda', color: a.status === 'PENDING' ? '#856404' : '#155724' }}>
                          {a.status === 'PENDING' ? <><Clock size={12} /> Bekliyor</> : <><CheckCircle size={12} /> Tamamlandı</>}
                        </div>
                        
                        {/* � İş Kuralı: Zaman sınırı + tek seferlik giriş kontrolü */}
                        {a.status === 'PENDING' && a.appointmentType === 'ONLINE' && (() => {
                          const roomKey = `MHRS_ROOM_${a.id}`;
                          const joinStatus = getJoinStatus(a.dateTime);
                          if (usedRooms.has(roomKey) || joinStatus === 'expired') {
                            return <span style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Süresi Doldu</span>;
                          }
                          if (joinStatus === 'not-yet') {
                            return <span style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#95a5a6', color: 'white', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Henüz Başlamadı</span>;
                          }
                          return (
                            <button
                              onClick={() => setJitsiRoom(roomKey)}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#e74c3c', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Video size={14} /> Katıl
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* REÇETELERİM */}
              {activeTab === 'prescriptions' && (
                <div className="pat-card">
                  <div className="pat-card-header" style={{ marginBottom: '16px' }}>
                    <h3>Reçetelerim</h3>
                    <span className="pat-badge gray">{prescriptions.length} reçete</span>
                  </div>
                  {prescriptions.length === 0 ? (
                    <p className="pat-muted">Sistemde kayıtlı reçeteniz bulunmamaktadır.</p>
                  ) : (
                    prescriptions.map(prec => (
                      <div key={prec.id} className="pat-rx-card">
                        <div className="pat-rx-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="pat-apt-icon" style={{ background: '#ecfdf5', width: '36px', height: '36px', flexShrink: 0 }}><Pill size={17} color="#10b981" /></div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>Dr. {prec.appointment?.doctor?.email?.split('@')[0] || 'Bilinmiyor'}</div>
                          </div>
                          <span className="pat-badge gray">{prec.appointment?.dateTime ? new Date(prec.appointment.dateTime).toLocaleDateString('tr-TR') : 'Tarih Yok'}</span>
                        </div>
                        <div className="pat-rx-body">
                          <div><span className="pat-rx-label">İlaçlar</span><span>{prec.medicineList}</span></div>
                          <div><span className="pat-rx-label" style={{ color: '#f59e0b' }}>Dozaj</span><span>{prec.dosage}</span></div>
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

      {/* JITSI — DOKUNULMAZ */}
      {jitsiRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px 20px', backgroundColor: '#1e1b4b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#e74c3c', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                Online Muayene Odası
              </h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#a5b4fc' }}>Bağlantı şifrelidir. Lütfen hekimin odaya katılmasını bekleyiniz.</p>
            </div>
            <button
              onClick={() => { setUsedRooms(prev => new Set([...prev, jitsiRoom])); setJitsiRoom(null); }}
              style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} /> Görüşmeden Ayrıl
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <JitsiMeeting
              domain="meet.systemli.org"
              roomName={jitsiRoom}
              configOverwrite={{
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableModeratorIndicator: true
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                SHOW_CHROME_EXTENSION_BANNER: false
              }}
              userInfo={{
                displayName: getFullName()
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
                iframeRef.style.border = 'none';
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientPanel;
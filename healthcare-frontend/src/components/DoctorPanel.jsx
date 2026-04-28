import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDoctorAppointments, 
  updateDoctorProfile, 
  completeAppointment, 
  doctorService,
  prescriptionService 
} from '../services/api';
import '../styles/DoctorPanel.css';

// 💊 GERÇEKÇİ İLAÇ VERİTABANI
const medDictionary = {
  "Dahiliye": ["Parol 500mg Tablet", "Lansor 30mg Kapsül", "Glifor 1000mg Film Tablet", "Tylolhot Poşet", "Dikloron 50mg"],
  "Kardiyoloji": ["Beloc 50mg Tablet", "Coraspin 100mg", "Lipitor 20mg", "Plavix 75mg", "Tansart 50mg"],
  "KBB": ["Augmentin 1000mg", "Iliadin %0.05 Sprey", "Arveles 25mg Tablet", "Klorhex Gargara", "Klamoks Bıd"],
  "Göz Hastalıkları": ["Refresh Tears Damla", "Tobradex Göz Damlası", "Suntear Damla", "Vigamox"],
  "Ortopedi": ["Muscoril Merhem", "Voltaren Emulgel", "Majezik 100mg", "Dolgit Krem", "Cabral 400mg"],
  "Cildiye": ["Roaccutane 20mg", "Fucidin Krem", "Ketoral Şampuan", "Zyrtec 10mg Tablet"],
  "Nöroloji": ["Neurontin 600mg", "Cymbalta 30mg", "Desyrel 50mg", "Lustral 50mg"],
  "Genel": ["Parol 500mg Tablet", "Arveles 25mg Tablet", "Gaviscon Şurup", "Aspirin"]
};

const DoctorPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments'); 
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '' });
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  // --- REÇETE YAZMA MODALI ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [examNotes, setExamNotes] = useState('');
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [currentMed, setCurrentMed] = useState('');
  const [currentDosage, setCurrentDosage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- GEÇMİŞİ GÖRÜNTÜLEME MODALI ---
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedHistoryApt, setSelectedHistoryApt] = useState(null);
  const [historyPrescription, setHistoryPrescription] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('doctorId');
    if (!id) navigate('/login');
    else {
      loadInitialData(id);
    }
  }, [navigate]);

  const loadInitialData = async (id) => {
    setLoading(true);
    try {
      const docRes = await doctorService.getDoctorById(id);
      if (docRes.data?.success) {
        setDoctorData(docRes.data.data);
        setProfileForm({ bio: docRes.data.data.bio || '' });
      }

      const aptRes = await getDoctorAppointments(id);
      let apts = aptRes.data?.success ? aptRes.data.data : (Array.isArray(aptRes.data) ? aptRes.data : []);
      setAppointments(apts.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))); 
      
    } catch (err) {
      console.error("Veriler yüklenirken hata oluştu:", err);
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { bio: profileForm.bio, specialization: doctorData.specialization };
      const res = await updateDoctorProfile(doctorData.id, payload);
      if (res.data?.success || res.status === 200) {
         setUpdateMsg({ text: "✅ Özgeçmişiniz başarıyla güncellendi.", type: 'success' });
         setTimeout(() => setUpdateMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setUpdateMsg({ text: "❌ Güncelleme başarısız.", type: 'error' });
    }
  };

  const openExamModal = (apt) => {
    setSelectedApt(apt);
    setExamNotes('');
    setPrescriptionList([]);
    setCurrentMed('');
    setCurrentDosage('');
    setModalOpen(true);
  };

  const addMedicineToList = () => {
    if (currentMed && currentDosage) {
      setPrescriptionList([...prescriptionList, { medicationName: currentMed, dosage: currentDosage }]);
      setCurrentMed(''); 
      setCurrentDosage('');
    }
  };

  const removeMedicine = (index) => {
    const newList = [...prescriptionList];
    newList.splice(index, 1);
    setPrescriptionList(newList);
  };

  const submitExamAndPrescription = async () => {
    if (!examNotes && prescriptionList.length === 0) {
      alert("Lütfen muayene notu girin veya reçete yazın.");
      return;
    }
    try {
      setIsSubmitting(true);
      await completeAppointment(selectedApt.id, { 
        notes: examNotes || "Not girilmedi.", 
        status: "COMPLETED" 
      });

      if (prescriptionList.length > 0) {
        const prescriptionPayload = {
          appointmentId: selectedApt.id,
          appointment: { id: selectedApt.id },
          patientId: selectedApt.patient?.id,
          doctorId: doctorData.id,
          medicineList: prescriptionList.map(m => m.medicationName).join(', '), 
          dosage: prescriptionList.map(m => m.dosage).join(', ') 
        };
        await prescriptionService.createPrescription(prescriptionPayload);
      }

      alert("✅ Randevu başarıyla tamamlandı ve Reçete kaydedildi!");
      setModalOpen(false);
      loadInitialData(doctorData.id); 
    } catch (err) {
      console.error(err);
      alert("❌ İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 TEMİZ VE ORİJİNAL ÇÖZÜM
  const openHistoryModal = async (apt) => {
    setSelectedHistoryApt(apt);
    setHistoryPrescription(null); 
    setViewModalOpen(true);
    setIsLoadingHistory(true);
    
    try {
      // Doğrudan hastanın id'si ile o hastanın reçetelerini çekiyoruz
      const res = await prescriptionService.getPatientPrescriptions(apt.patient.id);
      const prescriptions = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      const foundPrescription = prescriptions.find(p => p.appointment?.id === apt.id || p.appointmentId === apt.id);
      setHistoryPrescription(foundPrescription || null);
    } catch (err) {
      console.error("Reçete detayları çekilemedi", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getFullName = () => {
    if (doctorData?.firstName && doctorData?.lastName) return `${doctorData.firstName} ${doctorData.lastName}`;
    if (doctorData?.email) {
      const namePart = doctorData.email.split('@')[0];
      return namePart.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return 'Yükleniyor...';
  };

  const availableMedicines = doctorData?.specialization && medDictionary[doctorData.specialization] 
    ? medDictionary[doctorData.specialization] 
    : medDictionary["Genel"];

  return (
    <div className="doctor-dashboard">
      <aside className="doc-sidebar">
        <div className="doc-sidebar-header">
          <div className="doc-sidebar-logo">MHRS+</div>
          <div className="doc-sidebar-subtitle">Hekim Portalı</div>
        </div>
        <nav className="doc-nav-menu">
          <div className={`doc-nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><i>👨‍⚕️</i> Bekleyen Hastalar</div>
          <div className={`doc-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><i>📋</i> Muayene Geçmişi</div>
          <div className={`doc-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><i>⚙️</i> Profil & Uzmanlık</div>
        </nav>
        <div className="doc-sidebar-footer">
          <div className="doc-nav-item" onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ color: '#e74c3c', cursor: 'pointer' }}><i>🚪</i> Güvenli Çıkış</div>
        </div>
      </aside>

      <main className="doc-main-content">
        <header className="doc-top-header">
          <div className="doc-user-profile">
            <div style={{ color: '#7f8c8d', fontSize: '14px' }}>{getFullName()}</div>
            <div className="doc-avatar-circle">{doctorData?.email?.charAt(0).toUpperCase() || 'D'}</div>
          </div>
        </header>

        <div className="doc-content-wrapper">
          {loading && !doctorData ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#3498db', fontSize: '20px', fontWeight: 'bold' }}>Hekim Bilgileri Getiriliyor...</div>
          ) : (
            <>
              {activeTab === 'appointments' && (
                <div className="doc-glass-card">
                  <h2>👨‍⚕️ Bekleyen Randevular</h2>
                  {appointments.filter(a => a.status === 'PENDING').length === 0 ? (
                    <p style={{ color: '#7f8c8d' }}>Henüz bir randevunuz bulunmamaktadır.</p>
                  ) : (
                    appointments.filter(a => a.status === 'PENDING').map(apt => (
                      <div key={apt.id} style={{ padding: '20px', border: '1px solid #e1e8ed', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>T.C. {apt.patient?.identityNumber}</div>
                          <div style={{ color: '#3498db' }}>{new Date(apt.dateTime).toLocaleString('tr-TR')}</div>
                        </div>
                        <button className="btn-modern-blue" onClick={() => openExamModal(apt)}>Müdahale & Reçete</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="doc-glass-card">
                  <h2>📋 Muayene Geçmişi</h2>
                  {appointments.filter(a => a.status === 'COMPLETED').length === 0 ? (
                    <p style={{ color: '#7f8c8d' }}>Geçmiş muayene kaydınız bulunmamaktadır.</p>
                  ) : (
                    appointments.filter(a => a.status === 'COMPLETED').map(apt => (
                      <div key={apt.id} style={{ padding: '20px', border: '1px solid #e1e8ed', borderRadius: '10px', marginBottom: '15px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>
                            T.C. {apt.patient?.identityNumber} - {apt.patient?.firstName} {apt.patient?.lastName}
                          </div>
                          <div style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '5px' }}>
                            {new Date(apt.dateTime).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        <button 
                          onClick={() => openHistoryModal(apt)} 
                          style={{ padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2c3e50'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#34495e'}
                        >
                          👁️ Görüntüle
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="doc-glass-card" style={{ maxWidth: '700px' }}>
                  <h2>⚙️ Profil ve Uzmanlık Alanı</h2>
                  {updateMsg.text && <div style={{ padding: '12px', marginBottom: '15px', borderRadius: '6px', backgroundColor: updateMsg.type === 'success' ? '#d4edda' : '#f8d7da', color: updateMsg.type === 'success' ? '#155724' : '#721c24' }}>{updateMsg.text}</div>}
                  
                  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e1e8ed' }}>
                    <h3 style={{ fontSize: '16px', color: '#34495e', marginTop: 0 }}>Kurumsal Kimlik</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div><label style={{ fontSize: '12px', color: '#7f8c8d' }}>T.C. Kimlik No</label><div style={{ fontWeight: 'bold' }}>{doctorData?.identityNumber}</div></div>
                      <div><label style={{ fontSize: '12px', color: '#7f8c8d' }}>Hekim Adı Soyadı</label><div style={{ fontWeight: 'bold' }}>{getFullName()}</div></div>
                      <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '12px', color: '#7f8c8d' }}>Uzmanlık Alanı</label><div style={{ fontWeight: 'bold', color: '#3498db', fontSize: '18px' }}>{doctorData?.specialization || 'Belirtilmemiş'}</div></div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Özgeçmiş / Biyografi</label>
                    <textarea value={profileForm.bio} onChange={(e) => setProfileForm({bio: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #dfe6e9', minHeight: '120px' }} />
                    <div style={{ textAlign: 'right', marginTop: '15px' }}><button type="submit" className="btn-modern-blue">Kaydet</button></div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 1. MUAYENE VE REÇETE YAZMA MODALI */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '550px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>Muayene & Reçete Yaz</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#e74c3c' }}>✖</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#34495e' }}>📝 Muayene Notu / Teşhis</label>
              <textarea 
                value={examNotes} 
                onChange={(e) => setExamNotes(e.target.value)} 
                placeholder="Hastanın şikayeti ve teşhisinizi buraya yazın..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', minHeight: '80px', outline: 'none' }} 
              />
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#3498db' }}>💊 Dijital Reçete Oluştur</label>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select 
                  value={currentMed} 
                  onChange={(e) => setCurrentMed(e.target.value)}
                  style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }}
                >
                  <option value="">-- İlaç Seçiniz --</option>
                  {availableMedicines.map((med, idx) => (
                    <option key={idx} value={med}>{med}</option>
                  ))}
                </select>

                <input 
                  type="text" 
                  placeholder="Dozaj (Örn: 2x1 Tok)" 
                  value={currentDosage}
                  onChange={(e) => setCurrentDosage(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }}
                />
                
                <button onClick={addMedicineToList} style={{ padding: '10px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Ekle
                </button>
              </div>

              {prescriptionList.length > 0 && (
                <div style={{ borderTop: '1px solid #e1e8ed', paddingTop: '10px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>Reçeteye Eklenenler:</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {prescriptionList.map((item, index) => (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px 12px', border: '1px solid #ecf0f1', borderRadius: '6px', marginBottom: '5px', fontSize: '14px' }}>
                        <span><strong>{item.medicationName}</strong> - {item.dosage}</span>
                        <span onClick={() => removeMedicine(index)} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>Sil</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={submitExamAndPrescription} 
                disabled={isSubmitting}
                style={{ padding: '12px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Randevuyu ve Reçeteyi Tamamla'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. MUAYENE DETAY (GÖRÜNTÜLE) MODALI */}
      {viewModalOpen && selectedHistoryApt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '550px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>📄 Muayene Detayları</h2>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#e74c3c' }}>✖</button>
            </div>

            <div style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Hasta Bilgisi</div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{selectedHistoryApt.patient?.firstName} {selectedHistoryApt.patient?.lastName} (T.C. {selectedHistoryApt.patient?.identityNumber})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Muayene Tarihi</div>
                <div style={{ fontWeight: 'bold', color: '#3498db' }}>{new Date(selectedHistoryApt.dateTime).toLocaleString('tr-TR')}</div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', color: '#e67e22', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>📝 Muayene ve Şikayet Notu</h3>
              <div style={{ color: '#555', backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #eee', minHeight: '60px', fontStyle: selectedHistoryApt.notes ? 'normal' : 'italic' }}>
                {selectedHistoryApt.notes || 'Sisteme herhangi bir not veya şikayet girilmemiş.'}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', color: '#2ecc71', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>💊 Yazılan Reçete Bilgisi</h3>
              
              {isLoadingHistory ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d' }}>Reçete kayıtları aranıyor...</div>
              ) : historyPrescription ? (
                <div style={{ backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div><strong style={{ color: '#34495e' }}>İlaç Listesi:</strong> <span style={{ color: '#333' }}>{historyPrescription.medicineList}</span></div>
                  <div><strong style={{ color: '#34495e' }}>Dozaj (Kullanım):</strong> <span style={{ color: '#333' }}>{historyPrescription.dosage}</span></div>
                </div>
              ) : (
                <div style={{ color: '#e74c3c', fontStyle: 'italic', backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  Bu muayene sonucunda hastaya reçete yazılmamış.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorPanel;
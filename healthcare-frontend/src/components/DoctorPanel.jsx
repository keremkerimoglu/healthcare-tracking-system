import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { 
  getDoctorAppointments, 
  updateDoctorProfile, 
  completeAppointment, 
  doctorService,
  prescriptionService 
} from '../services/api';
import { Users, Video, ClipboardList, Settings, LogOut, UserCheck, Stethoscope, Clock, CheckCircle, Eye, X, FileText, Plus, Trash2, Pill, Save } from 'lucide-react';
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

  // 🔥 VIDEO KONFERANS STATE'İ
  const [jitsiRoom, setJitsiRoom] = useState(null);
  // 🔒 İş Kuralı: Bir kez girilip çıkılan odaları tutan liste
  const [usedRooms, setUsedRooms] = useState(new Set());

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

  // 🔒 İş Kuralı: Randevunun katılım durumunu hesaplar
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
    <div className="doc-dashboard-new">
      {/* SIDEBAR */}
      <aside className="doc-sidebar-new">
        <div className="doc-sidebar-hdr">
          <span className="doc-logo-badge">MHRS+</span>
          <span className="doc-logo-sub">Hekim Portalı</span>
        </div>
        <nav className="doc-nav-new">
          <div className={`doc-nav-item-new ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <Users size={18} /> <span>Bekleyen Hastalar</span>
          </div>
          <div className={`doc-nav-item-new ${activeTab === 'online-appointments' ? 'active' : ''}`} onClick={() => setActiveTab('online-appointments')}>
            <Video size={18} /> <span>Online Randevular</span>
          </div>
          <div className={`doc-nav-item-new ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <ClipboardList size={18} /> <span>Muayene Geçmişi</span>
          </div>
          <div className={`doc-nav-item-new ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <Settings size={18} /> <span>Profil &amp; Uzmanlık</span>
          </div>
        </nav>
        <div className="doc-sidebar-ftr">
          <div className="doc-nav-item-new doc-logout-new" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            <LogOut size={18} /> <span>Güvenli Çıkış</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="doc-main-new">
        <header className="doc-header-new">
          <div>
            <h1 className="doc-page-title-new">
              {activeTab === 'appointments' ? 'Bekleyen Hastalar' :
               activeTab === 'online-appointments' ? 'Online Randevular' :
               activeTab === 'history' ? 'Muayene Geçmişi' : 'Profil & Uzmanlık'}
            </h1>
            <p className="doc-page-sub-new">Dr. {getFullName()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {doctorData?.specialization && (
              <span className="doc-spec-hdr-badge">{doctorData.specialization}</span>
            )}
            <div className="doc-avatar-new">{doctorData?.email?.charAt(0).toUpperCase() || 'D'}</div>
          </div>
        </header>

        <div className="doc-content-new">
          {loading && !doctorData ? (
            <div className="doc-loading-new">Hekim Bilgileri Getiriliyor...</div>
          ) : (
            <>
              {/* YÜZ YÜZE RANDEVULAR */}
              {activeTab === 'appointments' && (
                <div className="doc-card-new">
                  <div className="doc-card-hdr">
                    <h3>Bekleyen Hastalar (Yüz Yüze)</h3>
                    <span className="doc-badge-new green">{appointments.filter(a => a.status === 'PENDING' && a.appointmentType !== 'ONLINE').length} hasta</span>
                  </div>
                  {appointments.filter(a => a.status === 'PENDING' && a.appointmentType !== 'ONLINE').length === 0 ? (
                    <p className="doc-muted-new">Bekleyen yüz yüze randevunuz bulunmamaktadır.</p>
                  ) : (
                    appointments.filter(a => a.status === 'PENDING' && a.appointmentType !== 'ONLINE').map(apt => (
                      <div key={apt.id} className="doc-apt-row-new">
                        <div className="doc-apt-icon-new"><UserCheck size={18} color="#10b981" /></div>
                        <div className="doc-apt-info-new">
                          <div className="doc-apt-patient-new">T.C. {apt.patient?.identityNumber}</div>
                          <div className="doc-apt-date-new"><Clock size={12} /> {new Date(apt.dateTime).toLocaleString('tr-TR')}</div>
                        </div>
                        <button className="doc-btn-primary-new" onClick={() => openExamModal(apt)}>
                          <Stethoscope size={15} /> Müdahale &amp; Reçete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ONLINE RANDEVULAR */}
              {activeTab === 'online-appointments' && (
                <div className="doc-card-new" style={{ borderTop: '4px solid #6366f1' }}>
                  <div className="doc-card-hdr">
                    <h3>Online Randevular</h3>
                    <span className="doc-badge-new indigo">{appointments.filter(a => a.status === 'PENDING' && a.appointmentType === 'ONLINE').length} randevu</span>
                  </div>
                  {appointments.filter(a => a.status === 'PENDING' && a.appointmentType === 'ONLINE').length === 0 ? (
                    <p className="doc-muted-new">Bekleyen online randevunuz bulunmamaktadır.</p>
                  ) : (
                    appointments.filter(a => a.status === 'PENDING' && a.appointmentType === 'ONLINE').map(apt => (
                      <div key={apt.id} className="doc-apt-row-new doc-apt-online-new">
                        <div className="doc-apt-icon-new" style={{ background: '#eef2ff' }}><Video size={18} color="#6366f1" /></div>
                        <div className="doc-apt-info-new">
                          <div className="doc-apt-patient-new">T.C. {apt.patient?.identityNumber}</div>
                          <div className="doc-apt-date-new"><Clock size={12} /> {new Date(apt.dateTime).toLocaleString('tr-TR')}</div>
                          <span className="doc-badge-new indigo" style={{ fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>Online</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* 🔒 İş Kuralı: getJoinStatus + usedRooms */}
                          {(() => {
                            const roomKey = `MHRS_ROOM_${apt.id}`;
                            const joinStatus = getJoinStatus(apt.dateTime);
                            if (usedRooms.has(roomKey) || joinStatus === 'expired') {
                              return <span className="doc-badge-new red">Süresi Doldu</span>;
                            }
                            if (joinStatus === 'not-yet') {
                              return <span className="doc-badge-new gray">Henüz Başlamadı</span>;
                            }
                            return (
                              <button className="doc-btn-video-new" onClick={() => setJitsiRoom(roomKey)}>
                                <Video size={15} /> Görüşmeye Katıl
                              </button>
                            );
                          })()}
                          {/* ❌ KIRMIZI ÇİZGİ: Bu buton hiçbir koşulda kaldırılamaz */}
                          <button className="doc-btn-primary-new" onClick={() => openExamModal(apt)}>
                            <Stethoscope size={15} /> Müdahale &amp; Reçete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MUAYENE GEÇMİŞİ */}
              {activeTab === 'history' && (
                <div className="doc-card-new">
                  <div className="doc-card-hdr">
                    <h3>Muayene Geçmişi</h3>
                    <span className="doc-badge-new gray">{appointments.filter(a => a.status === 'COMPLETED').length} kayıt</span>
                  </div>
                  {appointments.filter(a => a.status === 'COMPLETED').length === 0 ? (
                    <p className="doc-muted-new">Geçmiş muayene kaydınız bulunmamaktadır.</p>
                  ) : (
                    appointments.filter(a => a.status === 'COMPLETED').map(apt => (
                      <div key={apt.id} className="doc-apt-row-new">
                        <div className="doc-apt-icon-new" style={{ background: '#f0fdf4' }}><CheckCircle size={18} color="#10b981" /></div>
                        <div className="doc-apt-info-new">
                          <div className="doc-apt-patient-new">
                            {apt.patient?.firstName} {apt.patient?.lastName} <span className="doc-muted-new" style={{ fontSize: '13px' }}>— T.C. {apt.patient?.identityNumber}</span>
                          </div>
                          <div className="doc-apt-date-new"><Clock size={12} /> {new Date(apt.dateTime).toLocaleString('tr-TR')}</div>
                        </div>
                        <button className="doc-btn-secondary-new" onClick={() => openHistoryModal(apt)}>
                          <Eye size={15} /> Görüntüle
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PROFİL */}
              {activeTab === 'profile' && (
                <div className="doc-card-new" style={{ maxWidth: '700px' }}>
                  <div className="doc-card-hdr" style={{ marginBottom: '20px' }}>
                    <h3>Profil ve Uzmanlık Alanı</h3>
                  </div>
                  {updateMsg.text && (
                    <div className={`doc-alert-new ${updateMsg.type === 'success' ? 'success' : 'error'}`}>{updateMsg.text}</div>
                  )}
                  <div className="doc-id-box-new">
                    <div><div className="doc-id-label-new">T.C. Kimlik No</div><div className="doc-id-val-new">{doctorData?.identityNumber}</div></div>
                    <div><div className="doc-id-label-new">Hekim Adı Soyadı</div><div className="doc-id-val-new">{getFullName()}</div></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="doc-id-label-new">Uzmanlık Alanı</div>
                      <div className="doc-id-val-new" style={{ color: '#6366f1', fontSize: '20px' }}>{doctorData?.specialization || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <form onSubmit={handleProfileUpdate}>
                    <label className="doc-label-new">Özgeçmiş / Biyografi</label>
                    <textarea className="doc-input-new doc-textarea-new" value={profileForm.bio} onChange={(e) => setProfileForm({bio: e.target.value})} />
                    <div style={{ textAlign: 'right', marginTop: '16px' }}>
                      <button type="submit" className="doc-btn-primary-new"><Save size={15} /> Kaydet</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL 1: MUAYENE & REÇETE */}
      {modalOpen && (
        <div className="doc-modal-overlay-new">
          <div className="doc-modal-new">
            <div className="doc-modal-hdr-new">
              <h2>Muayene &amp; Reçete Yaz</h2>
              <button className="doc-modal-close-new" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="doc-modal-section-new">
              <label className="doc-label-new"><FileText size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Muayene Notu / Teşhis</label>
              <textarea
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
                placeholder="Hastanın şikayeti ve teşhisinizi buraya yazın..."
                className="doc-input-new doc-textarea-new"
              />
            </div>
            <div className="doc-modal-rx-box-new">
              <label className="doc-label-new" style={{ color: '#6366f1' }}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Dijital Reçete Oluştur</label>
              <div className="doc-modal-rx-row-new">
                <select value={currentMed} onChange={(e) => setCurrentMed(e.target.value)} className="doc-input-new" style={{ flex: 2 }}>
                  <option value="">-- İlaç Seçiniz --</option>
                  {availableMedicines.map((med, idx) => <option key={idx} value={med}>{med}</option>)}
                </select>
                <input type="text" placeholder="Dozaj (Örn: 2x1 Tok)" value={currentDosage} onChange={(e) => setCurrentDosage(e.target.value)} className="doc-input-new" style={{ flex: 1 }} />
                <button onClick={addMedicineToList} className="doc-btn-add-new"><Plus size={16} /> Ekle</button>
              </div>
              {prescriptionList.length > 0 && (
                <div className="doc-rx-list-new">
                  <div className="doc-muted-new" style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Reçeteye Eklenenler:</div>
                  {prescriptionList.map((item, index) => (
                    <div key={index} className="doc-rx-item-new">
                      <span><strong>{item.medicationName}</strong> — {item.dosage}</span>
                      <button onClick={() => removeMedicine(index)} className="doc-rx-del-new"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={submitExamAndPrescription} disabled={isSubmitting} className="doc-btn-submit-new">
                {isSubmitting ? 'Kaydediliyor...' : <><CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Randevuyu ve Reçeteyi Tamamla</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GEÇMİŞ GÖRÜNTÜLEME */}
      {viewModalOpen && selectedHistoryApt && (
        <div className="doc-modal-overlay-new">
          <div className="doc-modal-new">
            <div className="doc-modal-hdr-new">
              <h2>Muayene Detayları</h2>
              <button className="doc-modal-close-new" onClick={() => setViewModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="doc-history-info-new">
              <div>
                <div className="doc-muted-new" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hasta Bilgisi</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedHistoryApt.patient?.firstName} {selectedHistoryApt.patient?.lastName} (T.C. {selectedHistoryApt.patient?.identityNumber})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="doc-muted-new" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Muayene Tarihi</div>
                <div style={{ fontWeight: 700, color: '#6366f1' }}>{new Date(selectedHistoryApt.dateTime).toLocaleString('tr-TR')}</div>
              </div>
            </div>
            <div className="doc-modal-section-new">
              <label className="doc-label-new" style={{ color: '#f59e0b' }}><FileText size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Muayene ve Şikayet Notu</label>
              <div className="doc-notes-box-new" style={{ fontStyle: selectedHistoryApt.notes ? 'normal' : 'italic' }}>
                {selectedHistoryApt.notes || 'Sisteme herhangi bir not girilmemiş.'}
              </div>
            </div>
            <div>
              <label className="doc-label-new" style={{ color: '#10b981' }}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Yazılan Reçete Bilgisi</label>
              {isLoadingHistory ? (
                <div className="doc-muted-new" style={{ padding: '15px', textAlign: 'center' }}>Reçete kayıtları aranıyor...</div>
              ) : historyPrescription ? (
                <div className="doc-notes-box-new">
                  <div><strong style={{ color: '#475569' }}>İlaç Listesi:</strong> {historyPrescription.medicineList}</div>
                  <div style={{ marginTop: '8px' }}><strong style={{ color: '#475569' }}>Dozaj:</strong> {historyPrescription.dosage}</div>
                </div>
              ) : (
                <div className="doc-notes-box-new" style={{ color: '#ef4444', fontStyle: 'italic' }}>
                  Bu muayene sonucunda hastaya reçete yazılmamış.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JITSI — DOKUNULMAZ */}
      {jitsiRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px 20px', backgroundColor: '#1e1b4b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#e74c3c', borderRadius: '50%' }}></span>
                Online Muayene Odası — Hekim Görünümü
              </h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#a5b4fc' }}>Bağlantı şifrelidir. Hasta odaya katılmayı bekliyordur.</p>
            </div>
            <button
              onClick={() => { setUsedRooms(prev => new Set([...prev, jitsiRoom])); setJitsiRoom(null); }}
              style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              🚪 Görüşmeden Ayrıl
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
                displayName: `Dr. ${getFullName()}`
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

export default DoctorPanel;
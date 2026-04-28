import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, departmentService } from '../services/api';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Yeni Doktor Formu
  const [newDoc, setNewDoc] = useState({ identityNumber: '', email: '', password: '', specialization: '', departmentId: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const docRes = await adminService.getAllDoctors();
      setDoctors(docRes.data?.data || []);

      const deptRes = await departmentService.getAllDepartments();
      setDepartments(deptRes.data?.data || []);

      const patRes = await adminService.getAllPatients();
      setPatients(patRes.data?.data || []);
    } catch (err) {
      console.error("Veriler çekilemedi");
    }
    setLoading(false);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDoctor(newDoc);
      alert("✅ Doktor başarıyla oluşturuldu.");
      setNewDoc({ identityNumber: '', email: '', password: '', specialization: '', departmentId: '' });
      loadAllData();
    } catch (err) { alert("❌ Hata: Doktor eklenemedi."); }
  };

  const handleDeleteDoctor = async (id) => {
    if(!window.confirm("Bu doktoru silmek istediğinize emin misiniz?")) return;
    try {
      await adminService.deleteDoctor(id);
      loadAllData();
    } catch (err) { alert("Silme başarısız."); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">MHRS ADMIN</div>
        <nav className="admin-nav">
          <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
          <div className={`admin-nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>👨‍⚕️ Doktorlar</div>
          <div className={`admin-nav-item ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>🏥 Poliklinikler</div>
        </nav>
        <div className="admin-nav-item" onClick={handleLogout} style={{color: '#f87171', marginTop: 'auto'}}>🚪 Çıkış Yap</div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'dashboard' ? 'Sistem Özeti' : activeTab === 'doctors' ? 'Hekim Yönetimi' : 'Bölüm Yönetimi'}</h1>
        </header>

        {activeTab === 'dashboard' && (
          <div className="admin-grid">
            <div className="admin-stat-card"><h3>Toplam Hekim</h3><p>{doctors.length}</p></div>
            <div className="admin-stat-card"><h3>Kayıtlı Hasta</h3><p>{patients.length}</p></div>
            <div className="admin-stat-card"><h3>Aktif Poliklinik</h3><p>{departments.length}</p></div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="admin-card">
            <h3>Yeni Doktor Kaydı</h3>
            <form onSubmit={handleAddDoctor} className="admin-form">
              <input className="admin-input" placeholder="T.C. Kimlik" value={newDoc.identityNumber} onChange={e => setNewDoc({...newDoc, identityNumber: e.target.value})} required />
              <input className="admin-input" placeholder="E-posta" value={newDoc.email} onChange={e => setNewDoc({...newDoc, email: e.target.value})} required />
              <input className="admin-input" type="password" placeholder="Şifre" value={newDoc.password} onChange={e => setNewDoc({...newDoc, password: e.target.value})} required />
              <input className="admin-input" placeholder="Uzmanlık" value={newDoc.specialization} onChange={e => setNewDoc({...newDoc, specialization: e.target.value})} required />
              <select className="admin-input" value={newDoc.departmentId} onChange={e => setNewDoc({...newDoc, departmentId: e.target.value})} required>
                <option value="">Poliklinik Seçin...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <button type="submit" className="btn-admin">Kaydet</button>
            </form>

            <table className="admin-table">
              <thead>
                <tr><th>T.C.</th><th>E-posta / İsim</th><th>Uzmanlık</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.identityNumber}</td>
                    <td>{doc.email}</td>
                    <td>{doc.specialization}</td>
                    <td><button className="btn-del" onClick={() => handleDeleteDoctor(doc.id)}>Sil</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
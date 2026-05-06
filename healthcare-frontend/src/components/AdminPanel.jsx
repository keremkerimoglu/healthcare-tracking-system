import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Stethoscope, Building2, TrendingUp,
  Settings, LogOut, Users, Calendar, Video, Banknote,
  Activity, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { adminService, departmentService } from '../services/api';
import '../styles/AdminPanel.css';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─────────────────────────────────────────────
// Yardımcı: KPI Kartı
// ─────────────────────────────────────────────
const KpiCard = ({ icon: Icon, title, value, sub, color, bg }) => (
  <div className="adm-kpi-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="adm-kpi-icon" style={{ backgroundColor: bg }}>
      <Icon size={22} color={color} />
    </div>
    <div className="adm-kpi-body">
      <div className="adm-kpi-title">{title}</div>
      <div className="adm-kpi-value">{value}</div>
      {sub && <div className="adm-kpi-sub">{sub}</div>}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Yardımcı: Aktivite ikonu
// ─────────────────────────────────────────────
const ActivityIcon = ({ type, color }) => {
  const props = { size: 16, color };
  if (type === 'video')   return <Video {...props} />;
  if (type === 'iptal')   return <AlertCircle {...props} />;
  if (type === 'randevu') return <Clock {...props} />;
  return <CheckCircle2 {...props} />;
};

// ─────────────────────────────────────────────
// ANA BİLEŞEN
// ─────────────────────────────────────────────
const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // — Gerçek backend verileri —
  const [doctors,     setDoctors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients,    setPatients]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [dashboardData, setDashboardData]       = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // — Yeni Doktor Formu —
  const [newDoc, setNewDoc] = useState({
    identityNumber: '', email: '', password: '', specialization: '', departmentId: ''
  });

  // — Finans sekmesi yıl filtresi —
  const [selectedYear] = useState(new Date().getFullYear());

  // ── İlk yükleme ──────────────────────────────
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setDashboardLoading(true);
    try {
      const [docRes, deptRes, patRes, dashRes] = await Promise.all([
        adminService.getAllDoctors(),
        departmentService.getAllDepartments(),
        adminService.getAllPatients(),
        adminService.getDashboard(),
      ]);
      setDoctors(docRes.data?.data      || []);
      setDepartments(deptRes.data?.data || []);
      setPatients(patRes.data?.data     || []);
      setDashboardData(dashRes.data?.data || null);
    } catch (err) {
      console.error('Admin verileri yüklenemedi', err);
    }
    setLoading(false);
    setDashboardLoading(false);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDoctor(newDoc);
      alert('✅ Doktor başarıyla oluşturuldu.');
      setNewDoc({ identityNumber: '', email: '', password: '', specialization: '', departmentId: '' });
      loadAllData();
    } catch { alert('❌ Hata: Doktor eklenemedi.'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Bu doktoru silmek istediğinize emin misiniz?')) return;
    try {
      await adminService.deleteDoctor(id);
      loadAllData();
    } catch { alert('Silme başarısız.'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // ── KPI hesapları (API verisinden) ──────────────────
  const weeklyTrends   = dashboardData?.weeklyTrends   || [];
  const deptStats      = dashboardData?.departmentStats || [];
  const weeklyRevTotal = weeklyTrends.reduce((s, d) => s + (d.revenue      || 0), 0);
  const weeklyAptTotal = weeklyTrends.reduce((s, d) => s + (d.appointments || 0), 0);

  // ── Sidebar menü tanımı ─────────────────────
  const navItems = [
    { key: 'dashboard',   label: 'Dashboard',         Icon: LayoutDashboard },
    { key: 'doctors',     label: 'Doktor Yönetimi',   Icon: Stethoscope     },
    { key: 'departments', label: 'Poliklinikler',      Icon: Building2       },
    { key: 'finance',     label: 'Finans',             Icon: TrendingUp      },
    { key: 'settings',    label: 'Ayarlar',            Icon: Settings        },
  ];

  const pageTitle = navItems.find(n => n.key === activeTab)?.label ?? 'Panel';

  // ── RENDER ───────────────────────────────────
  return (
    <div className="admin-dashboard">

      {/* ─── SIDEBAR ─── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="adm-logo-badge">MHRS+</span>
          <span className="adm-logo-sub">Başhekim Paneli</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ key, label, Icon }) => (
            <div
              key={key}
              className={`admin-nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={18} />
              {label}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-nav-item adm-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Güvenli Çıkış
          </div>
        </div>
      </aside>

      {/* ─── ANA İÇERİK ─── */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="adm-page-title">{pageTitle}</h1>
            <p className="adm-page-date">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="adm-header-badge">
            <Activity size={16} color="#6366f1" />
            <span>Sistem Aktif</span>
          </div>
        </header>

        {(loading || dashboardLoading) && (
          <div className="adm-loading">Veriler yükleniyor...</div>
        )}

        {/* ════════════════════════════════════
            SEKME: DASHBOARD
        ════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="adm-section">

            {/* KPI Kartları */}
            <div className="admin-grid">
              <KpiCard
                icon={Banknote}  color="#6366f1" bg="#eef2ff"
                title="Toplam Gelir"
                value={`₺${(dashboardData?.totalRevenue || 0).toLocaleString('tr-TR')}`}
                sub="Tamamlanan randevular"
              />
              <KpiCard
                icon={Calendar}  color="#06b6d4" bg="#ecfeff"
                title="Toplam Randevu"
                value={dashboardData?.totalAppointments ?? '—'}
                sub={`Son 7 gün: ${weeklyAptTotal}`}
              />
              <KpiCard
                icon={Users}     color="#10b981" bg="#ecfdf5"
                title="Aktif Doktor"
                value={dashboardData?.activeDoctors ?? doctors.length}
                sub={`${departments.length} poliklinik`}
              />
              <KpiCard
                icon={Video}     color="#f59e0b" bg="#fffbeb"
                title="Online Oran"
                value={`%${dashboardData?.onlineRatio ?? 0}`}
                sub="Görüşme / toplam randevu"
              />
            </div>

            {/* Grafikler */}
            <div className="adm-charts-row">

              {/* Bar Chart – Haftalık Randevu & Gelir */}
              <div className="admin-card adm-chart-card">
                <div className="adm-card-header">
                  <h3>Haftalık Randevu &amp; Gelir Trendi</h3>
                  <span className="adm-badge indigo">Bu Hafta</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyTrends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="left"  tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }}
                           tickFormatter={v => `₺${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(val, name) => name === 'revenue' ? [`₺${val.toLocaleString('tr-TR')}`, 'Gelir'] : [val, 'Randevu']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px' }} />
                    <Bar yAxisId="left"  dataKey="appointments" name="Randevu" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar yAxisId="right" dataKey="revenue"      name="Gelir"   fill="#06b6d4" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart – Poliklinik Dağılımı */}
              <div className="admin-card adm-chart-card adm-pie-card">
                <div className="adm-card-header">
                  <h3>Poliklinik Hasta Dağılımı</h3>
                  <span className="adm-badge teal">Bu Ay</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={deptStats}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={3}
                      dataKey="patientCount"
                      nameKey="department"
                    >
                      {deptStats.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [v, n]}
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="adm-pie-legend">
                  {deptStats.map((d, i) => (
                    <div key={i} className="adm-pie-legend-item">
                      <span className="adm-pie-dot" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span>{d.department}</span>
                      <strong>{d.patientCount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alt satır: Doktor Yük Tablosu + Aktivite Akışı */}
            <div className="adm-bottom-row">

              {/* Doktor Mesai Tablosu */}
              <div className="admin-card adm-table-card">
                <div className="adm-card-header">
                  <h3>Hekim Çalışma Özeti</h3>
                  <span className="adm-badge gray">Haftalık</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
                  <Clock size={36} color="#c7d2fe" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#6366f1' }}>Çok Yakında</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Hekim çalışma özeti modülü yakında aktif olacak.</span>
                </div>
              </div>

              {/* Son Aktiviteler */}
              <div className="admin-card adm-activity-card">
                <div className="adm-card-header">
                  <h3>Canlı Aktivite Akışı</h3>
                  <span className="adm-live-dot" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
                  <Activity size={36} color="#c7d2fe" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#6366f1' }}>Çok Yakında</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Gerçek zamanlı aktivite akışı yakında aktif olacak.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            SEKME: DOKTOR YÖNETİMİ
        ════════════════════════════════════ */}
        {activeTab === 'doctors' && (
          <div className="adm-section">
            <div className="admin-card" style={{ marginBottom: '30px' }}>
              <div className="adm-card-header" style={{ marginBottom: '20px' }}>
                <h3>Yeni Hekim Kaydı</h3>
              </div>
              <form onSubmit={handleAddDoctor} className="admin-form">
                <input className="admin-input" placeholder="T.C. Kimlik No" value={newDoc.identityNumber}
                  onChange={e => setNewDoc({...newDoc, identityNumber: e.target.value})} required />
                <input className="admin-input" placeholder="E-posta Adresi" value={newDoc.email}
                  onChange={e => setNewDoc({...newDoc, email: e.target.value})} required />
                <input className="admin-input" type="password" placeholder="Şifre" value={newDoc.password}
                  onChange={e => setNewDoc({...newDoc, password: e.target.value})} required />
                <input className="admin-input" placeholder="Uzmanlık Alanı" value={newDoc.specialization}
                  onChange={e => setNewDoc({...newDoc, specialization: e.target.value})} required />
                <select className="admin-input" value={newDoc.departmentId}
                  onChange={e => setNewDoc({...newDoc, departmentId: e.target.value})} required>
                  <option value="">Poliklinik Seçin...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button type="submit" className="btn-admin">
                  <Stethoscope size={15} style={{ marginRight: '6px' }} />
                  Kaydet
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="adm-card-header" style={{ marginBottom: '15px' }}>
                <h3>Kayıtlı Hekimler</h3>
                <span className="adm-badge indigo">{doctors.length} hekim</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>T.C. Kimlik</th><th>E-posta</th><th>Uzmanlık</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>Kayıtlı hekim bulunamadı.</td></tr>
                  ) : doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.identityNumber}</td>
                      <td>{doc.email}</td>
                      <td><span className="adm-spec-badge">{doc.specialization}</span></td>
                      <td>
                        <button className="btn-del" onClick={() => handleDeleteDoctor(doc.id)}>Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            SEKME: POLİKLİNİKLER
        ════════════════════════════════════ */}
        {activeTab === 'departments' && (
          <div className="adm-section">
            <div className="admin-grid" style={{ marginBottom: '30px' }}>
              {departments.map(dept => (
                <div key={dept.id} className="admin-card adm-dept-card">
                  <div className="adm-dept-icon"><Building2 size={24} color="#6366f1" /></div>
                  <div className="adm-dept-name">{dept.name}</div>
                  <div className="adm-dept-sub">
                    {deptStats.find(ds => ds.department === dept.name)?.patientCount ?? '—'} tamamlanan randevu
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-card">
              <div className="adm-card-header" style={{ marginBottom: '10px' }}>
                <h3>Poliklinik Hasta Dağılımı (Grafik)</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptStats} layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip formatter={(v) => [v, 'Tamamlanan']}
                    contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                  <Bar dataKey="patientCount" name="Tamamlanan" radius={[0,6,6,0]}>
                    {deptStats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            SEKME: FİNANS
        ════════════════════════════════════ */}
        {activeTab === 'finance' && (
          <div className="adm-section">
            <div className="admin-grid" style={{ marginBottom: '30px' }}>
              <KpiCard icon={Banknote} color="#6366f1" bg="#eef2ff"
                title="Haftalık Toplam Gelir"
                value={`₺${weeklyRevTotal.toLocaleString('tr-TR')}`}
                sub={`${selectedYear} — Bu Hafta`}
              />
              <KpiCard icon={TrendingUp} color="#10b981" bg="#ecfdf5"
                title="Ortalama Seans Ücreti"
                value="₺200"
                sub="Sabit seans ücreti"
              />
              <KpiCard icon={Calendar} color="#f59e0b" bg="#fffbeb"
                title="Toplam Randevu"
                value={weeklyAptTotal}
                sub="Bu hafta gerçekleşen"
              />
            </div>

            <div className="admin-card">
              <div className="adm-card-header" style={{ marginBottom: '15px' }}>
                <h3>Haftalık Gelir Trendi (₺)</h3>
                <span className="adm-badge indigo">{selectedYear}</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickFormatter={v => `₺${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(v) => [`₺${v.toLocaleString('tr-TR')}`, 'Gelir']}
                    contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Line type="monotone" dataKey="revenue" name="Günlük Gelir"
                    stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }}
                    activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-card" style={{ marginTop: '25px' }}>
              <div className="adm-card-header" style={{ marginBottom: '10px' }}>
                <h3>Günlük Gelir Detay Tablosu</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Gün</th><th style={{textAlign:'right'}}>Randevu Sayısı</th><th style={{textAlign:'right'}}>Toplam Gelir</th><th style={{textAlign:'right'}}>Ort. Seans</th></tr>
                </thead>
                <tbody>
                  {weeklyTrends.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.day}</td>
                      <td style={{ textAlign: 'right' }}>{row.appointments}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                        ₺{(row.revenue || 0).toLocaleString('tr-TR')}
                      </td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>
                        ₺{row.appointments > 0 ? Math.round(row.revenue / row.appointments).toLocaleString('tr-TR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            SEKME: AYARLAR
        ════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="adm-section">
            <div className="admin-card adm-settings-card">
              <div className="adm-card-header" style={{ marginBottom: '25px' }}>
                <h3>Sistem Ayarları</h3>
              </div>

              <div className="adm-settings-group">
                <label className="adm-settings-label">Hastane Adı</label>
                <input className="admin-input" defaultValue="MHRS+ Devlet Hastanesi" style={{ maxWidth: '400px' }} />
              </div>
              <div className="adm-settings-group">
                <label className="adm-settings-label">Varsayılan Randevu Süresi (dk)</label>
                <input className="admin-input" type="number" defaultValue={30} style={{ maxWidth: '150px' }} />
              </div>
              <div className="adm-settings-group">
                <label className="adm-settings-label">Online Görüşme Sunucusu</label>
                <input className="admin-input" defaultValue="meet.systemli.org" style={{ maxWidth: '400px' }} />
              </div>
              <div className="adm-settings-group">
                <label className="adm-settings-label">Mesai Başlangıç Saati</label>
                <input className="admin-input" type="time" defaultValue="09:00" style={{ maxWidth: '150px' }} />
              </div>
              <div className="adm-settings-group">
                <label className="adm-settings-label">Mesai Bitiş Saati</label>
                <input className="admin-input" type="time" defaultValue="17:00" style={{ maxWidth: '150px' }} />
              </div>

              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <strong style={{ color: '#92400e', fontSize: '14px' }}>Not</strong>
                </div>
                <p style={{ color: '#78716c', fontSize: '14px', margin: 0 }}>
                  Ayarlar sayfası henüz backend entegrasyonuna bağlanmamıştır. Bu alandaki değerler yalnızca gösterim amaçlıdır.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminPanel;
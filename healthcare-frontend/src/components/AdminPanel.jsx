import React, { useState, useEffect } from 'react';
import { reportService, doctorService, feedbackService, departmentService } from '../services/api';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [adminId, setAdminId] = useState(localStorage.getItem('adminId') || '');
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('adminEmail') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('adminId') ? true : false);

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, doctors, feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard data
  const [monthlyData, setMonthlyData] = useState({});
  const [departmentData, setDepartmentData] = useState({});
  const [financialData, setFinancialData] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState([]);

  // Doctor management
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDoctorForm, setNewDoctorForm] = useState({
    email: '',
    password: '',
    specialization: '',
    departmentId: null,
    bio: ''
  });

  // Feedback
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [approvedFeedback, setApprovedFeedback] = useState([]);

  useEffect(() => {
    if (isLoggedIn && adminId) {
      if (activeTab === 'dashboard') {
        fetchDashboardData();
      } else if (activeTab === 'doctors') {
        fetchDoctors();
        fetchDepartments();
      } else if (activeTab === 'feedback') {
        fetchFeedback();
      }
    }
  }, [isLoggedIn, adminId, activeTab]);

  // ==================== LOGIN ====================
  const handleAdminLogin = () => {
    if (!adminId) {
      setError('Lütfen admin ID giriniz.');
      return;
    }
    localStorage.setItem('adminId', adminId);
    localStorage.setItem('adminEmail', adminEmail);
    setIsLoggedIn(true);
    setError('');
  };

  // ==================== DASHBOARD ====================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [monthly, dept, financial, performance] = await Promise.all([
        reportService.getMonthlyAppointments(),
        reportService.getDepartmentStats(),
        reportService.getFinancialSummary(),
        reportService.getDoctorPerformance()
      ]);

      setMonthlyData(monthly.data.data || {});
      setDepartmentData(dept.data.data || {});
      setFinancialData(financial.data.data || {});
      setDoctorPerformance(performance.data.data || []);
    } catch (err) {
      setError('Dashboard verisi yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== DOCTORS ====================
  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors();
      if (response.data.success) {
        setDoctors(response.data.data || []);
      }
    } catch (err) {
      setError('Doktor listesi yüklenirken hata: ' + err.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments();
      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (err) {
      console.error('Bölüm yükleme hatası:', err);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctorForm.email || !newDoctorForm.password || !newDoctorForm.specialization) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    try {
      setLoading(true);
      const response = await doctorService.createDoctor(newDoctorForm);
      if (response.data.success) {
        setDoctors([...doctors, response.data.data]);
        setNewDoctorForm({
          email: '',
          password: '',
          specialization: '',
          departmentId: null,
          bio: ''
        });
        setError('');
        alert('✅ Doktor başarıyla eklendi!');
        fetchDoctors();
      }
    } catch (err) {
      setError('Doktor eklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDoctor = async (doctorId) => {
    if (!window.confirm('Bu doktoru pasifleştirmek istediğinizden emin misiniz?')) return;

    try {
      const response = await doctorService.deactivateDoctor(doctorId);
      if (response.data.success) {
        setDoctors(doctors.map(d => d.id === doctorId ? { ...d, active: false } : d));
        alert('✅ Doktor pasifleştirildi.');
      }
    } catch (err) {
      setError('Doktor pasifleştirilirken hata: ' + err.message);
    }
  };

  const handleReactivateDoctor = async (doctorId) => {
    try {
      const response = await doctorService.reactivateDoctor(doctorId);
      if (response.data.success) {
        setDoctors(doctors.map(d => d.id === doctorId ? { ...d, active: true } : d));
        alert('✅ Doktor aktifleştirildi.');
      }
    } catch (err) {
      setError('Doktor aktifleştirilirken hata: ' + err.message);
    }
  };

  // ==================== FEEDBACK ====================
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const [pending, approved] = await Promise.all([
        feedbackService.getPendingFeedback(),
        feedbackService.getApprovedFeedback()
      ]);

      setPendingFeedback(pending.data.data || []);
      setApprovedFeedback(approved.data.data || []);
    } catch (err) {
      setError('Feedback yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFeedback = async (feedbackId) => {
    try {
      const response = await feedbackService.approveFeedback(feedbackId);
      if (response.data.success) {
        setPendingFeedback(pendingFeedback.filter(f => f.id !== feedbackId));
        setApprovedFeedback([...approvedFeedback, response.data.data]);
        alert('✅ Yorum onaylandı.');
      }
    } catch (err) {
      setError('Yorum onaylanırken hata: ' + err.message);
    }
  };

  const handleRejectFeedback = async (feedbackId) => {
    if (!window.confirm('Bu yorumu reddetmek istediğinizden emin misiniz?')) return;

    try {
      const response = await feedbackService.rejectFeedback(feedbackId);
      if (response.data.success) {
        setPendingFeedback(pendingFeedback.filter(f => f.id !== feedbackId));
        alert('✅ Yorum reddedildi.');
      }
    } catch (err) {
      setError('Yorum reddedilirken hata: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    setIsLoggedIn(false);
    setAdminId('');
    setAdminEmail('');
  };

  // ==================== RENDER LOGIN ====================
  if (!isLoggedIn) {
    return (
      <div className="admin-panel">
        <h1>⚙️ Admin Paneli</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="login-container">
          <div className="login-box">
            <h2>Admin Girişi</h2>

            <div className="form-group">
              <label htmlFor="adminId">Admin ID:</label>
              <input
                id="adminId"
                type="number"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Örn: 1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Opsiyonel):</label>
              <input
                id="email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@email.com"
              />
            </div>

            <button className="btn btn-primary" onClick={handleAdminLogin}>
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER DASHBOARD ====================
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Paneli</h1>
        <div className="admin-info">
          <span>{adminEmail || 'Admin'}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          👨‍⚕️ Doktor Yönetimi
        </button>
        <button
          className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          💬 Yorum Onaylama ({pendingFeedback.length})
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Yükleniyor...
            </div>
          ) : (
            <div className="dashboard-container">
              {/* Financial Summary */}
              <div className="dashboard-section">
                <h2>💰 Finansal Özet</h2>
                {financialData ? (
                  <div className="financial-grid">
                    <div className="financial-card">
                      <label>Toplam Gelir</label>
                      <value className="amount">{financialData.totalRevenue?.toFixed(2)} ₺</value>
                    </div>
                    <div className="financial-card">
                      <label>Doktor Ödemeleri</label>
                      <value className="amount">{financialData.totalDoctorPayment?.toFixed(2)} ₺</value>
                    </div>
                    <div className="financial-card">
                      <label>Net Kar</label>
                      <value className="amount profit">{financialData.netProfit?.toFixed(2)} ₺</value>
                    </div>
                    <div className="financial-card">
                      <label>Tamamlanan Randevular</label>
                      <value className="count">{financialData.completedAppointments}</value>
                    </div>
                  </div>
                ) : (
                  <p>Veri yükleniyor...</p>
                )}
              </div>

              {/* Appointment & Department Stats */}
              <div className="stats-row">
                <div className="dashboard-section">
                  <h2>📅 Aylık Randevu İstatistikleri</h2>
                  <div className="stats-list">
                    {Object.entries(monthlyData).length === 0 ? (
                      <p>Veri yok</p>
                    ) : (
                      Object.entries(monthlyData).map(([month, count]) => (
                        <div key={month} className="stat-item">
                          <span className="stat-label">{month}</span>
                          <div className="stat-bar">
                            <div className="stat-fill" style={{ width: `${(count / 50) * 100}%` }}>
                              {count}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>🏥 Branş Bazlı Yoğunluk</h2>
                  <div className="stats-list">
                    {Object.entries(departmentData).length === 0 ? (
                      <p>Veri yok</p>
                    ) : (
                      Object.entries(departmentData).map(([dept, count]) => (
                        <div key={dept} className="stat-item">
                          <span className="stat-label">{dept}</span>
                          <div className="stat-bar">
                            <div className="stat-fill dept" style={{ width: `${(count / 30) * 100}%` }}>
                              {count}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Performance */}
              <div className="dashboard-section">
                <h2>🌟 Doktor Performansı</h2>
                <div className="performance-table">
                  <thead>
                    <tr>
                      <th>Doktor</th>
                      <th>Bölüm</th>
                      <th>Toplam Randevu</th>
                      <th>Tamamlanan</th>
                      <th>Ortalama Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPerformance.length === 0 ? (
                      <tr><td colSpan="5">Veri yok</td></tr>
                    ) : (
                      doctorPerformance.map((perf) => (
                        <tr key={perf.doctorId}>
                          <td>{perf.doctorEmail}</td>
                          <td>{perf.department}</td>
                          <td>{perf.totalAppointments}</td>
                          <td>{perf.completedAppointments}</td>
                          <td>
                            <div className="rating">
                              {'⭐'.repeat(Math.round(perf.averageRating))}
                              <span className="rating-text">{perf.averageRating.toFixed(1)}/5</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Doctor Management Tab */}
      {activeTab === 'doctors' && (
        <div className="tab-content">
          <div className="doctors-container">
            {/* Add New Doctor Form */}
            <div className="section">
              <h2>➕ Yeni Doktor Ekle</h2>
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={newDoctorForm.email}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                      placeholder="doktor@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Şifre:</label>
                    <input
                      type="password"
                      value={newDoctorForm.password}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Uzmanlık Alanı:</label>
                    <input
                      type="text"
                      value={newDoctorForm.specialization}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                      placeholder="Örn: Kardiyoloji"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bölüm:</label>
                    <select
                      value={newDoctorForm.departmentId || ''}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, departmentId: e.target.value })}
                    >
                      <option value="">Bölüm seçin</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Biyografi:</label>
                  <textarea
                    value={newDoctorForm.bio}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, bio: e.target.value })}
                    placeholder="Doktor hakkında bilgi..."
                    rows="3"
                  />
                </div>

                <button className="btn btn-primary" onClick={handleAddDoctor} disabled={loading}>
                  {loading ? 'Ekleniyor...' : 'Doktor Ekle'}
                </button>
              </div>
            </div>

            {/* Doctors List */}
            <div className="section">
              <h2>📋 Doktor Listesi ({doctors.length})</h2>
              <div className="doctors-grid">
                {doctors.length === 0 ? (
                  <p>Doktor bulunamadı.</p>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor.id} className={`doctor-card ${!doctor.active ? 'inactive' : ''}`}>
                      <div className="doctor-card-header">
                        <h3>{doctor.email}</h3>
                        <span className={`status-badge ${doctor.active ? 'active' : 'inactive'}`}>
                          {doctor.active ? '🟢 Aktif' : '🔴 Pasif'}
                        </span>
                      </div>
                      <div className="doctor-card-body">
                        <p><strong>Uzmanlık:</strong> {doctor.specialization}</p>
                        {doctor.department && <p><strong>Bölüm:</strong> {doctor.department.name}</p>}
                        {doctor.bio && <p><strong>Biyografi:</strong> {doctor.bio}</p>}
                      </div>
                      <div className="doctor-card-actions">
                        {doctor.active ? (
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeactivateDoctor(doctor.id)}
                          >
                            Pasifleştir
                          </button>
                        ) : (
                          <button
                            className="btn btn-small btn-success"
                            onClick={() => handleReactivateDoctor(doctor.id)}
                          >
                            Aktifleştir
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Approval Tab */}
      {activeTab === 'feedback' && (
        <div className="tab-content">
          <div className="feedback-container">
            {/* Pending Feedback */}
            <div className="feedback-section pending">
              <h2>⏳ Beklemede Olan Yorumlar ({pendingFeedback.length})</h2>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Yükleniyor...
                </div>
              ) : pendingFeedback.length === 0 ? (
                <p className="empty-message">Beklemede yorum yok.</p>
              ) : (
                <div className="feedback-list">
                  {pendingFeedback.map((feedback) => (
                    <div key={feedback.id} className="feedback-card pending-card">
                      <div className="feedback-header">
                        <div className="rating-stars">
                          {'⭐'.repeat(feedback.rating)}
                        </div>
                        <span className="date">
                          {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="feedback-body">
                        <p className="comment">{feedback.comment}</p>
                        <div className="info">
                          <span><strong>Hasta:</strong> {feedback.patient?.email}</span>
                          <span><strong>Doktor:</strong> {feedback.doctor?.email}</span>
                        </div>
                      </div>
                      <div className="feedback-actions">
                        <button
                          className="btn btn-small btn-success"
                          onClick={() => handleApproveFeedback(feedback.id)}
                        >
                          ✅ Onayla
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleRejectFeedback(feedback.id)}
                        >
                          ❌ Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Feedback */}
            <div className="feedback-section approved">
              <h2>✅ Onaylanan Yorumlar ({approvedFeedback.length})</h2>
              {approvedFeedback.length === 0 ? (
                <p className="empty-message">Onaylanan yorum yok.</p>
              ) : (
                <div className="feedback-list">
                  {approvedFeedback.map((feedback) => (
                    <div key={feedback.id} className="feedback-card approved-card">
                      <div className="feedback-header">
                        <div className="rating-stars">
                          {'⭐'.repeat(feedback.rating)}
                        </div>
                        <span className="date">
                          {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="feedback-body">
                        <p className="comment">{feedback.comment}</p>
                        <div className="info">
                          <span><strong>Hasta:</strong> {feedback.patient?.email}</span>
                          <span><strong>Doktor:</strong> {feedback.doctor?.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

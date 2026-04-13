import React, { useState } from 'react';
import AppointmentBooking from './components/AppointmentBooking';
import PatientPanel from './components/PatientPanel';
import DoctorPanel from './components/DoctorPanel';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('menu'); // menu, patientBooking, patientPanel, doctorPanel, adminPanel

  const handlePatientFlow = () => {
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorEmail');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    setActiveView('patientBooking');
  };

  const handleDoctorFlow = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientEmail');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    setActiveView('doctorPanel');
  };

  const handleAdminFlow = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientEmail');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorEmail');
    setActiveView('adminPanel');
  };

  const handleBackToMenu = () => {
    setActiveView('menu');
  };

  return (
    <div className="App">
      {activeView === 'menu' && (
        <div className="menu-screen">
          <div className="menu-container">
            <h1>🏥 Sağlık Sistemi</h1>
            <p className="menu-subtitle">Hoş geldiniz! Lütfen rol seçin:</p>
            
            <div className="menu-buttons">
              <button className="menu-btn patient-btn" onClick={handlePatientFlow}>
                <span className="btn-icon">👤</span>
                <div className="btn-content">
                  <h3>Hasta Paneli</h3>
                  <p>Randevu al ve reçetelerini görüntüle</p>
                </div>
              </button>

              <button className="menu-btn doctor-btn" onClick={handleDoctorFlow}>
                <span className="btn-icon">👨‍⚕️</span>
                <div className="btn-content">
                  <h3>Doktor Paneli</h3>
                  <p>Randevularını yönet ve reçete yazı</p>
                </div>
              </button>

              <button className="menu-btn admin-btn" onClick={handleAdminFlow}>
                <span className="btn-icon">⚙️</span>
                <div className="btn-content">
                  <h3>Admin Paneli</h3>
                  <p>Sistem istatistikleri ve yönetimi</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'patientBooking' && (
        <div className="view-container">
          <button className="back-btn" onClick={handleBackToMenu}>← Menüye Dönem</button>
          <AppointmentBooking />
        </div>
      )}

      {activeView === 'patientPanel' && (
        <div className="view-container">
          <button className="back-btn" onClick={handleBackToMenu}>← Menüye Dönem</button>
          <PatientPanel />
        </div>
      )}

      {activeView === 'doctorPanel' && (
        <div className="view-container">
          <button className="back-btn" onClick={handleBackToMenu}>← Menüye Dönem</button>
          <DoctorPanel />
        </div>
      )}

      {activeView === 'adminPanel' && (
        <div className="view-container">
          <button className="back-btn" onClick={handleBackToMenu}>← Menüye Dönem</button>
          <AdminPanel />
        </div>
      )}
    </div>
  );
}

export default App;

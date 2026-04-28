import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Bütün Sayfalarımızı İçeriyi Aktarıyoruz (Import)
import Login from './components/Login';
import PatientPanel from './components/PatientPanel';
import DoctorPanel from './components/DoctorPanel';
import AdminPanel from './components/AdminPanel'; // İşte eksik olan ve hataya sebep olan satır buydu!

function App() {
  return (
    <Router>
      <Routes>
        {/* Giriş Sayfası */}
        <Route path="/login" element={<Login />} />

        {/* Hasta Paneli */}
        <Route path="/patient" element={<PatientPanel />} />

        {/* Doktor Paneli */}
        <Route path="/doctor" element={<DoctorPanel />} />

        {/* Admin Paneli */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Eğer kullanıcı boş bir adrese (/) girerse, 
          onu otomatik olarak Login sayfasına gönder 
        */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Tanımsız bir adrese girilirse de Login'e at 
        */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
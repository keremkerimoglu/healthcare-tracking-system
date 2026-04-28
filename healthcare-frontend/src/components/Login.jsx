import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  // Her form için ayrı stateler tutuyoruz ki biri yazarken diğeri karışmasın
  const [patientData, setPatientData] = useState({ tc: '', pass: '' });
  const [doctorData, setDoctorData] = useState({ tc: '', pass: '' });
  const [adminData, setAdminData] = useState({ tc: '', pass: '' });
  
  const [loading, setLoading] = useState(false);
  const [errorRole, setErrorRole] = useState(null); // Hangi panelde hata göstereceğiz?
  const [errorMsg, setErrorMsg] = useState('');

  // Güvenlik: Zaten giriş yapmışsa şutla
  useEffect(() => {
    if (localStorage.getItem('patientId')) navigate('/patient', { replace: true });
    else if (localStorage.getItem('doctorId')) navigate('/doctor', { replace: true });
    else if (localStorage.getItem('adminId')) navigate('/admin', { replace: true });
  }, [navigate]);

  const handleLoginSubmit = async (e, role) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    let tc = '';
    let pass = '';

    if (role === 'patient') { tc = patientData.tc; pass = patientData.pass; }
    else if (role === 'doctor') { tc = doctorData.tc; pass = doctorData.pass; }
    else if (role === 'admin') { tc = adminData.tc; pass = adminData.pass; }

    const tcknRegex = /^\d{11}$/;
    if (!tcknRegex.test(tc)) {
      setErrorRole(role);
      setErrorMsg('T.C. Kimlik 11 rakam olmalıdır.');
      return;
    }
    if (!pass) {
      setErrorRole(role);
      setErrorMsg('Lütfen parolanızı giriniz.');
      return;
    }

    try {
      setLoading(true);
      setErrorRole(null);
      setErrorMsg('');
      
      const response = await userService.login(tc, pass);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        if (role === 'patient') {
          localStorage.setItem('patientId', userData.id);
          localStorage.setItem('patientIdentityNumber', tc);
          localStorage.setItem('jwtToken', token);
          navigate('/patient', { replace: true });
        } 
        else if (role === 'doctor') {
          localStorage.setItem('doctorId', userData.id);
          localStorage.setItem('doctorIdentityNumber', tc);
          localStorage.setItem('jwtToken', token);
          navigate('/doctor', { replace: true });
        }
        else if (role === 'admin') {
          // 🔥 TEK DEĞİŞEN YER BURASI: Artık alert yok, doğrudan admin sayfasına uçuyorsun!
          localStorage.setItem('adminId', userData.id);
          localStorage.setItem('jwtToken', token);
          navigate('/admin', { replace: true });
        }
      } else {
        setErrorRole(role);
        setErrorMsg(response.data.message || 'Giriş başarısız.');
      }
    } catch (err) {
      setErrorRole(role);
      setErrorMsg('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-login-container">
      
      {/* --- HASTA PANELİ (YEŞİL) --- */}
      <div className="split-panel panel-patient">
        <div className="overlay"></div>
        <div className="panel-content">
          <div className="panel-icon">👤</div>
          <h2 className="panel-title">Hasta</h2>
          
          <form className="hover-login-form" onSubmit={(e) => handleLoginSubmit(e, 'patient')}>
            {errorRole === 'patient' && <div className="hover-error">{errorMsg}</div>}
            <input 
              type="text" 
              className="modern-hover-input" 
              placeholder="T.C. Kimlik No" 
              maxLength="11"
              value={patientData.tc}
              onChange={(e) => setPatientData({...patientData, tc: e.target.value.replace(/\D/g, '')})}
            />
            <input 
              type="password" 
              className="modern-hover-input" 
              placeholder="Parola" 
              value={patientData.pass}
              onChange={(e) => setPatientData({...patientData, pass: e.target.value})}
            />
            <button type="submit" className="modern-hover-btn" disabled={loading}>
              {loading && errorRole === 'patient' ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>

      {/* --- DOKTOR PANELİ (MAVİ) --- */}
      <div className="split-panel panel-doctor">
        <div className="overlay"></div>
        <div className="panel-content">
          <div className="panel-icon">👨‍⚕️</div>
          <h2 className="panel-title">Hekim</h2>
          
          <form className="hover-login-form" onSubmit={(e) => handleLoginSubmit(e, 'doctor')}>
            {errorRole === 'doctor' && <div className="hover-error">{errorMsg}</div>}
            <input 
              type="text" 
              className="modern-hover-input" 
              placeholder="T.C. Kimlik No" 
              maxLength="11"
              value={doctorData.tc}
              onChange={(e) => setDoctorData({...doctorData, tc: e.target.value.replace(/\D/g, '')})}
            />
            <input 
              type="password" 
              className="modern-hover-input" 
              placeholder="Parola" 
              value={doctorData.pass}
              onChange={(e) => setDoctorData({...doctorData, pass: e.target.value})}
            />
            <button type="submit" className="modern-hover-btn" disabled={loading}>
               {loading && errorRole === 'doctor' ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>

      {/* --- ADMIN PANELİ (KIRMIZI) --- */}
      <div className="split-panel panel-admin">
        <div className="overlay"></div>
        <div className="panel-content">
          <div className="panel-icon">⚙️</div>
          <h2 className="panel-title">Yönetici</h2>
          
          <form className="hover-login-form" onSubmit={(e) => handleLoginSubmit(e, 'admin')}>
            {errorRole === 'admin' && <div className="hover-error">{errorMsg}</div>}
            <input 
              type="text" 
              className="modern-hover-input" 
              placeholder="Admin Kimlik No" 
              maxLength="11"
              value={adminData.tc}
              onChange={(e) => setAdminData({...adminData, tc: e.target.value.replace(/\D/g, '')})}
            />
            <input 
              type="password" 
              className="modern-hover-input" 
              placeholder="Parola" 
              value={adminData.pass}
              onChange={(e) => setAdminData({...adminData, pass: e.target.value})}
            />
            <button type="submit" className="modern-hover-btn" disabled={loading}>
               {loading && errorRole === 'admin' ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;
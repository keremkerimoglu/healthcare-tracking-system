import React, { useState, useEffect } from 'react';
import { departmentService, doctorService, appointmentService } from '../services/api';
import '../styles/AppointmentBooking.css';

const AppointmentBooking = () => {
  const [step, setStep] = useState(1); // 1: Department, 2: Doctor, 3: Date/Time, 4: Confirmation
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientId, setPatientId] = useState(localStorage.getItem('patientId') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successDetails, setSuccessDetails] = useState(null);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    // Check if patient is already logged in
    const savedPatientId = localStorage.getItem('patientId');
    if (savedPatientId) {
      setPatientId(savedPatientId);
      setStep(2);
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      setError('Bölümleri yüklerken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = async (dept) => {
    setSelectedDepartment(dept);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime(null);
    setTimeSlots([]);
    
    try {
      setLoading(true);
      const response = await doctorService.getDoctorsByDepartment(dept.id);
      if (response.data.success) {
        setDoctors(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Doktorları yüklerken hata oluştu: ' + err.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime(null);
    setTimeSlots([]);
    setError('');
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime(null);

    if (!date || !selectedDoctor) return;

    try {
      setLoading(true);
      const response = await appointmentService.getAvailableSlots(selectedDoctor.id, date);
      if (response.data.success) {
        const slots = response.data.data;
        if (!slots || slots.length === 0) {
          setError('Seçilen tarihte müsait zaman aralığı bulunmamaktadır.');
          setTimeSlots([]);
        } else {
          setTimeSlots(slots);
          setError('');
        }
      }
    } catch (err) {
      setError('Zaman aralıklarını yüklerken hata oluştu: ' + err.message);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setError('');
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientId) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const appointmentData = {
        doctorId: selectedDoctor.id,
        patientId: parseInt(patientId),
        dateTime: selectedTime,
        notes: notes || 'Randevu notları'
      };

      const response = await appointmentService.bookAppointment(appointmentData);
      
      if (response.data.success) {
        setSuccess('Randevu başarıyla oluşturuldu!');
        setSuccessDetails({
          doctorName: selectedDoctor.email,
          specialization: selectedDoctor.specialization,
          dateTime: formatDateTime(selectedTime),
          notes: notes
        });
        setStep(4);
      } else {
        setError(response.data.message || 'Randevu oluşturulamadı.');
      }
    } catch (err) {
      setError('Randevu oluşturulurken hata oluştu: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAppointment = () => {
    setStep(2);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime(null);
    setNotes('');
    setSuccess('');
    setSuccessDetails(null);
  };

  const handlePatientLogin = async () => {
    if (!patientEmail || !patientPassword) {
      setError('Lütfen email ve şifreyi giriniz.');
      return;
    }

    try {
      setLoading(true);
      // Since we don't have a specific patient login endpoint, we'll use patient ID
      // In a real application, you would authenticate and get the patient ID
      localStorage.setItem('patientEmail', patientEmail);
      localStorage.setItem('patientId', patientId);
      setStep(2);
      setError('');
    } catch (err) {
      setError('Giriş yapılırken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="appointment-booking">
      <h1>🏥 Randevu Al</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Step 1: Patient Login */}
      {step === 1 && (
        <div className="booking-container">
          <div className="booking-section">
            <div className="section-title">Hasta Girişi</div>
            
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Yükleniyor...
              </div>
            ) : (
              <div className="patient-input-group">
                <label htmlFor="patientId">Hasta ID:</label>
                <input
                  id="patientId"
                  type="number"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Örn: 1"
                />

                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="örnek@email.com"
                />

                <label htmlFor="password">Şifre:</label>
                <input
                  id="password"
                  type="password"
                  value={patientPassword}
                  onChange={(e) => setPatientPassword(e.target.value)}
                  placeholder="Şifreyi giriniz"
                />

                <button className="btn btn-primary" onClick={handlePatientLogin}>
                  Giriş Yap ve Devam Et
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Department */}
      {step >= 2 && (
        <div className="booking-container">
          <div className="booking-section">
            <div className="section-title">1. Poliklinik Seçin</div>

            {loading && step === 2 ? (
              <div className="loading">
                <div className="spinner"></div>
                Bölümler yükleniyor...
              </div>
            ) : departments.length === 0 ? (
              <div className="empty-state">Poliklinik bulunamadı.</div>
            ) : (
              <div className="department-grid">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className={`department-card ${selectedDepartment?.id === dept.id ? 'selected' : ''}`}
                    onClick={() => handleDepartmentSelect(dept)}
                  >
                    <h3>{dept.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step >= 2 && selectedDepartment && (
        <div className="booking-container">
          <div className="booking-section">
            <div className="section-title">2. Doktor Seçin</div>

            {loading && step === 2 ? (
              <div className="loading">
                <div className="spinner"></div>
                Doktorlar yükleniyor...
              </div>
            ) : doctors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                Bu bölümde doktor bulunmamaktadır.
              </div>
            ) : (
              <div className="doctor-grid">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="doctor-name">{doctor.email}</div>
                    <div className="doctor-spec">
                      {doctor.specialization || 'Uzmanlaşma bilgisi yok'}
                    </div>
                    {doctor.ratingAvg && (
                      <div className="doctor-rating">
                        <span className="rating-stars">★</span>
                        {doctor.ratingAvg.toFixed(1)} / 5.0
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select Date and Time */}
      {step >= 3 && selectedDoctor && (
        <div className="booking-container">
          <div className="booking-section">
            <div className="section-title">3. Tarih ve Saati Seçin</div>

            <div className="calendar-container">
              <div className="date-input-group">
                <label htmlFor="appointmentDate">Randevu Tarihi:</label>
                <input
                  id="appointmentDate"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                />
              </div>

              {selectedDate && (
                <>
                  <div className="form-group">
                    <label>Müsait Saatleri Seçin:</label>
                    {loading ? (
                      <div className="loading">
                        <div className="spinner"></div>
                        Saatleri yükleniyor...
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="empty-state">
                        Bu tarihte müsait saat bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="time-slots">
                        {timeSlots.map((slot, index) => (
                          <button
                            key={index}
                            className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                            onClick={() => handleTimeSelect(slot)}
                          >
                            {new Date(slot).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Notlarınız (Opsiyonel):</label>
                    <textarea
                      id="notes"
                      className="notes-textarea"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Örn: İlaç alerjim var..."
                    ></textarea>
                  </div>
                </>
              )}

              {selectedDate && selectedTime && (
                <div className="summary-box">
                  <div className="summary-item">
                    <strong>Doktor:</strong>
                    <span>{selectedDoctor.email}</span>
                  </div>
                  <div className="summary-item">
                    <strong>Uzmanlaşma:</strong>
                    <span>{selectedDoctor.specialization}</span>
                  </div>
                  <div className="summary-item">
                    <strong>Tarih ve Saat:</strong>
                    <span>{formatDateTime(selectedTime)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedTime && (
            <div className="button-group">
              <button className="btn btn-success" onClick={handleBookAppointment} disabled={loading}>
                {loading ? 'Randevu Oluşturuluyor...' : 'Randevuyu Onayla'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Success Message */}
      {step === 4 && successDetails && (
        <div className="booking-container">
          <div className="booking-section">
            <div className="success-message">
              <h2>✅ Randevu Başarıyla Oluşturuldu!</h2>
              <p>Randevu detayları:</p>
              <div className="summary-box">
                <div className="summary-item">
                  <strong>Doktor:</strong>
                  <span>{successDetails.doctorName}</span>
                </div>
                <div className="summary-item">
                  <strong>Uzmanlaşma:</strong>
                  <span>{successDetails.specialization}</span>
                </div>
                <div className="summary-item">
                  <strong>Tarih ve Saat:</strong>
                  <span>{successDetails.dateTime}</span>
                </div>
                {successDetails.notes && (
                  <div className="summary-item">
                    <strong>Notlar:</strong>
                    <span>{successDetails.notes}</span>
                  </div>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleNewAppointment} style={{ marginTop: '20px' }}>
                Yeni Randevu Al
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;

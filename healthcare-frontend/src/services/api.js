import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const departmentService = {
  getAllDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`)
};

export const doctorService = {
  getAllDoctors: () => api.get('/doctors'),
  createDoctor: (doctorData) => api.post('/doctors', doctorData),
  getDoctorsByDepartment: (departmentId) => api.get(`/doctors/department/${departmentId}`),
  getDoctorsBySpecialization: (specialization) => api.get(`/doctors/specialization/${specialization}`),
  deactivateDoctor: (doctorId) => api.patch(`/doctors/${doctorId}/deactivate`),
  reactivateDoctor: (doctorId) => api.patch(`/doctors/${doctorId}/reactivate`)
};

export const appointmentService = {
  bookAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  checkAvailability: (doctorId, dateTime) => 
    api.get(`/appointments/doctor/${doctorId}/available`, { params: { dateTime } }),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/appointments/doctor/${doctorId}/available-slots`, { params: { date } }),
  getPatientAppointments: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getDoctorTodayAppointments: (doctorId) => api.get(`/appointments/doctor/${doctorId}/today`),
  getDoctorAppointmentsByDate: (doctorId, date) => 
    api.get(`/appointments/doctor/${doctorId}/by-date`, { params: { date } }),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel-patient`)
};

export const patientService = {
  getPatientById: (id) => api.get(`/patients/${id}`),
  createPatient: (patientData) => api.post('/patients', patientData),
  updateProfile: (id, profileData) => api.put(`/patients/${id}/profile`, profileData)
};

export const prescriptionService = {
  createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  getAllPrescriptions: () => api.get('/prescriptions')
};

export const feedbackService = {
  submitFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  getAllFeedback: () => api.get('/feedback'),
  getApprovedFeedback: () => api.get('/feedback/approved'),
  getPendingFeedback: () => api.get('/feedback/pending'),
  getDoctorFeedback: (doctorId) => api.get(`/feedback/doctor/${doctorId}`),
  getAverageDoctorRating: (doctorId) => api.get(`/feedback/doctor/${doctorId}/average-rating`),
  approveFeedback: (feedbackId) => api.put(`/feedback/${feedbackId}/approve`),
  rejectFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}/reject`)
};

export const reportService = {
  getMonthlyAppointments: () => api.get('/reports/monthly-appointments'),
  getDepartmentStats: () => api.get('/reports/department-stats'),
  getFinancialSummary: () => api.get('/reports/financial-summary'),
  getDoctorPerformance: () => api.get('/reports/doctor-performance')
};

export default api;

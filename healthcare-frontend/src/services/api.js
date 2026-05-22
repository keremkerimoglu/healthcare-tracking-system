import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const userService = {
  login: (identityNumber, password) => api.post('/users/login', { identityNumber, password }),
};

export const patientService = {
  getPatientById: (id) => api.get(`/patients/${id}`),
  updateProfile: (id, data) => api.put(`/patients/${id}/profile`, data),
};

export const departmentService = {
  getAllDepartments: () => api.get('/departments'),
};

export const doctorService = {
  getDoctorsByDepartment: (departmentId) => api.get(`/departments/${departmentId}/doctors`),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
};

export const appointmentService = {
  getPatientAppointments: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}/slots?date=${date}`),
  bookAppointment: (data) => api.post('/appointments', data),
};

export const prescriptionService = {
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  createPrescription: (data) => api.post('/prescriptions', data),
};

export const feedbackService = {
  submitFeedback: (data) => api.post('/feedbacks', data), 
};

export const drugService = {
  getAllDrugs: () => api.get('/drugs'),
};

export const adminService = {
  getAllDoctors: () => api.get('/doctors'),
  getAllPatients: () => api.get('/patients'),
  createDoctor: (data) => api.post('/doctors', data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  getDashboard: () => api.get('/admin/dashboard'),
};

export const cancelAppointmentByDoctor = (id) => api.put(`/appointments/${id}/cancel`);
export const getDoctorAppointments = (id) => api.get(`/appointments/doctor/${id}`);
export const completeAppointment = (id, data) => api.put(`/appointments/${id}/complete`, data);
export const updateDoctorProfile = (id, data) => api.put(`/doctors/${id}/profile`, data);

export default api;
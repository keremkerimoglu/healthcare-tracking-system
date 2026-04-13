package com.healthcare.service;

import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for Admin entity
 * Handles admin operations and system management
 */
@Service
@Transactional
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new admin
     */
    public Admin createAdmin(Admin admin) {
        if (admin.getPassword() != null && !admin.getPassword().startsWith("$2")) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        return adminRepository.save(admin);
    }

    /**
     * Find admin by ID
     */
    public Optional<Admin> findAdminById(Long id) {
        return adminRepository.findById(id);
    }

    /**
     * Get all admins
     */
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    /**
     * Add a new doctor (only admin)
     */
    public Doctor addDoctor(Doctor doctor) {
        if (doctor.getPassword() != null && !doctor.getPassword().startsWith("$2")) {
            doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        }
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    /**
     * View financial reports summary (mock implementation)
     */
    public String viewFinancialReports() {
        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();
        return String.format("Total Doctors: %d, Total Patients: %d", totalDoctors, totalPatients);
    }

    /**
     * Monitor system performance (mock implementation)
     */
    public String monitorPerformance() {
        long doctorCount = doctorRepository.count();
        long patientCount = patientRepository.count();
        return String.format("System Health - Doctors: %d, Patients: %d", doctorCount, patientCount);
    }

    /**
     * Get admin by email
     */
    public Optional<Admin> findAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    /**
     * Delete admin by ID
     */
    public void deleteAdminById(Long id) {
        adminRepository.deleteById(id);
    }

    // ==================== REPORTING & STATISTICS ====================

    /**
     * Get monthly appointment statistics
     * Returns a map with month as key and count as value
     */
    public Map<String, Integer> getMonthlyAppointmentStats() {
        List<Appointment> appointments = appointmentRepository.findAll();
        Map<String, Integer> monthlyStats = new LinkedHashMap<>();
        
        // Group by month
        appointments.stream()
                .collect(Collectors.groupingBy(apt -> {
                    YearMonth ym = YearMonth.from(apt.getDateTime());
                    return ym.toString(); // YYYY-MM format
                }, Collectors.counting()))
                .forEach((month, count) -> monthlyStats.put(month, count.intValue()));
        
        return monthlyStats;
    }

    /**
     * Get department-wise appointment statistics (Branş bazlı yoğunluk)
     */
    public Map<String, Integer> getDepartmentStats() {
        Map<String, Integer> departmentStats = new HashMap<>();
        
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            int count = (int) appointmentRepository.findAll().stream()
                    .filter(apt -> apt.getDoctor().getDepartment().getId().equals(dept.getId()))
                    .count();
            departmentStats.put(dept.getName(), count);
        }
        
        return departmentStats;
    }

    /**
     * Get financial summary (Finansal özet - varsayımsal ücretlendirme)
     * Assumptions: Appointment cost: 100 TL, Doctor salary: 3000 TL/month
     */
    public Map<String, Object> getFinancialSummary() {
        Map<String, Object> financialSummary = new HashMap<>();
        
        List<Appointment> completedAppointments = appointmentRepository.findAll().stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());
        
        // Calculate revenue
        double appointmentCost = 100.0; // TL per appointment
        double totalRevenue = completedAppointments.size() * appointmentCost;
        
        // Calculate salary expense (estimate: 50 TL per completed appointment to doctor)
        double doctorSharePerAppointment = 50.0;
        double totalDoctorPayment = completedAppointments.size() * doctorSharePerAppointment;
        
        // Net profit
        double netProfit = totalRevenue - totalDoctorPayment;
        
        financialSummary.put("totalRevenue", totalRevenue);
        financialSummary.put("totalDoctorPayment", totalDoctorPayment);
        financialSummary.put("netProfit", netProfit);
        financialSummary.put("completedAppointments", completedAppointments.size());
        financialSummary.put("appointmentCost", appointmentCost);
        financialSummary.put("doctorSharePerAppointment", doctorSharePerAppointment);
        
        return financialSummary;
    }

    /**
     * Get doctor performance statistics
     */
    public List<Map<String, Object>> getDoctorPerformance() {
        List<Map<String, Object>> performanceList = new ArrayList<>();
        
        List<Doctor> doctors = doctorRepository.findAll();
        for (Doctor doctor : doctors) {
            Map<String, Object> performance = new HashMap<>();
            
            List<Appointment> doctorAppointments = appointmentRepository.findAll().stream()
                    .filter(apt -> apt.getDoctor().getId().equals(doctor.getId()))
                    .collect(Collectors.toList());
            
            long completedCount = doctorAppointments.stream()
                    .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                    .count();
            
            double avgRating = feedbackRepository.findAll().stream()
                    .filter(fb -> fb.getDoctor().getId().equals(doctor.getId()))
                    .mapToInt(Feedback::getRating)
                    .average()
                    .orElse(0.0);
            
            performance.put("doctorId", doctor.getId());
            performance.put("doctorEmail", doctor.getEmail());
            performance.put("totalAppointments", doctorAppointments.size());
            performance.put("completedAppointments", completedCount);
            performance.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            performance.put("department", doctor.getDepartment() != null ? doctor.getDepartment().getName() : "N/A");
            
            performanceList.add(performance);
        }
        
        return performanceList;
    }

    /**
     * Deactivate doctor (soft delete via isActive flag)
     */
    public Doctor deactivateDoctor(Long doctorId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setActive(false);
            doctor.setUpdatedAt(LocalDateTime.now());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    /**
     * Reactivate doctor
     */
    public Doctor reactivateDoctor(Long doctorId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setActive(true);
            doctor.setUpdatedAt(LocalDateTime.now());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    /**
     * Get pending (unapproved) feedback
     */
    public List<Feedback> getPendingFeedback() {
        return feedbackRepository.findAll().stream()
                .filter(fb -> !fb.getIsApproved())
                .collect(Collectors.toList());
    }

    /**
     * Approve feedback
     */
    public Feedback approveFeedback(Long feedbackId) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            feedback.setIsApproved(true);
            feedback.setUpdatedAt(LocalDateTime.now());
            return feedbackRepository.save(feedback);
        }
        return null;
    }

    /**
     * Reject feedback
     */
    public void rejectFeedback(Long feedbackId) {
        feedbackRepository.deleteById(feedbackId);
    }

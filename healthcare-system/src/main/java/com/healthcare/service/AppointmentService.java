package com.healthcare.service;

import com.healthcare.entity.*;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Appointment entity
 * Handles appointment booking, cancellation, and history
 */
@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    /**
     * Book a new appointment
     */
    public Appointment bookAppointment(Long doctorId, Long patientId, LocalDateTime dateTime, String notes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        Optional<Patient> patientOpt = patientRepository.findById(patientId);

        if (doctorOpt.isPresent() && patientOpt.isPresent()) {
            Appointment appointment = new Appointment(dateTime, doctorOpt.get(), patientOpt.get());
            appointment.setNotes(notes);
            appointment.setStatus(AppointmentStatus.PENDING);
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    /**
     * Find appointment by ID
     */
    public Optional<Appointment> findAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    /**
     * Get all appointments
     */
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    /**
     * Get patient's appointment history
     */
    public List<Appointment> getPatientAppointmentHistory(Long patientId) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getPatient().getId().equals(patientId))
                .collect(Collectors.toList());
    }

    /**
     * Get doctor's appointments
     */
    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctorId))
                .collect(Collectors.toList());
    }

    /**
     * Cancel appointment by patient
     */
    public Appointment cancelAppointmentByPatient(Long appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(AppointmentStatus.CANCELLED_BY_PATIENT);
            appointment.setUpdatedAt(LocalDateTime.now());
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    /**
     * Cancel appointment by doctor
     */
    public Appointment cancelAppointmentByDoctor(Long appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(AppointmentStatus.CANCELLED_BY_DOCTOR);
            appointment.setUpdatedAt(LocalDateTime.now());
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    /**
     * Complete appointment
     */
    public Appointment completeAppointment(Long appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setUpdatedAt(LocalDateTime.now());
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    /**
     * Get upcoming appointments
     */
    public List<Appointment> getUpcomingAppointments() {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getDateTime().isAfter(LocalDateTime.now()) &&
                        !a.getStatus().equals(AppointmentStatus.CANCELLED_BY_PATIENT) &&
                        !a.getStatus().equals(AppointmentStatus.CANCELLED_BY_DOCTOR))
                .collect(Collectors.toList());
    }

    /**
     * Delete appointment by ID
     */
    public void deleteAppointmentById(Long id) {
        appointmentRepository.deleteById(id);
    }

    /**
     * Check if doctor is available at the specified time
     */
    public boolean isDoctorAvailable(Long doctorId, LocalDateTime appointmentDateTime) {
        List<Appointment> doctorAppointments = appointmentRepository.findByDoctorId(doctorId);
        
        // Check if there's already an appointment at the same time
        // Consider a 30-minute buffer (appointments can overlap if 30+ minutes apart)
        for (Appointment appointment : doctorAppointments) {
            if (!appointment.getStatus().equals(AppointmentStatus.CANCELLED_BY_PATIENT) &&
                !appointment.getStatus().equals(AppointmentStatus.CANCELLED_BY_DOCTOR)) {
                
                LocalDateTime existingTime = appointment.getDateTime();
                long minutesDifference = Math.abs(
                    java.time.temporal.ChronoUnit.MINUTES.between(existingTime, appointmentDateTime)
                );
                
                // Must have at least 30 minutes between appointments
                if (minutesDifference < 30) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Get available time slots for a doctor on a specific date
     */
    public List<LocalDateTime> getAvailableTimeSlots(Long doctorId, LocalDateTime date) {
        List<LocalDateTime> slots = new java.util.ArrayList<>();
        LocalDateTime startOfDay = date.withHour(9).withMinute(0); // 9 AM
        LocalDateTime endOfDay = date.withHour(18).withMinute(0);   // 6 PM
        
        // Generate 30-minute slots
        LocalDateTime currentSlot = startOfDay;
        while (currentSlot.isBefore(endOfDay)) {
            if (isDoctorAvailable(doctorId, currentSlot)) {
                slots.add(currentSlot);
            }
            currentSlot = currentSlot.plusMinutes(30);
        }
        
        return slots;
    }

    /**
     * Get doctor's approved appointments for today
     */
    public List<Appointment> getDoctorTodayAppointments(Long doctorId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctorId) &&
                        a.getDateTime().isAfter(startOfDay) &&
                        a.getDateTime().isBefore(endOfDay) &&
                        a.getStatus().equals(AppointmentStatus.PENDING))
                .sorted((a1, a2) -> a1.getDateTime().compareTo(a2.getDateTime()))
                .collect(Collectors.toList());
    }

    /**
     * Get doctor's approved appointments for a specific date
     */
    public List<Appointment> getDoctorAppointmentsByDate(Long doctorId, LocalDateTime date) {
        LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);
        
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctorId) &&
                        a.getDateTime().isAfter(startOfDay) &&
                        a.getDateTime().isBefore(endOfDay) &&
                        (a.getStatus().equals(AppointmentStatus.PENDING) || 
                         a.getStatus().equals(AppointmentStatus.COMPLETED)))
                .sorted((a1, a2) -> a1.getDateTime().compareTo(a2.getDateTime()))
                .collect(Collectors.toList());
    }
}

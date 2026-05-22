package com.healthcare.service;

import com.healthcare.entity.Doctor;
import com.healthcare.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for Doctor entity
 * Handles doctor management and rating management
 */
@Service
@Transactional
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new doctor
     */
    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getPassword() != null && !doctor.getPassword().startsWith("$2")) {
            doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        }
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        if (doctor.getRatingAvg() == null) {
            doctor.setRatingAvg(0.0);
        }
        return doctorRepository.save(doctor);
    }

    /**
     * Find doctor by ID
     */
    public Optional<Doctor> findDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    /**
     * Get all doctors
     */
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    /**
     * Get doctors by specialization
     */
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    /**
     * Get doctors by department ID
     */
    public List<Doctor> getDoctorsByDepartmentId(Long departmentId) {
        return doctorRepository.findByDepartmentId(departmentId);
    }

    /**
     * Update doctor rating
     */
    public Doctor updateRating(Long doctorId, Double newRating) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            double currentAvg = doctor.getRatingAvg() != null ? doctor.getRatingAvg() : 0.0;
            // Simple averaging - in production would track number of ratings
            doctor.setRatingAvg(currentAvg + (newRating - currentAvg) / 2);
            doctor.setUpdatedAt(LocalDateTime.now());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    /**
     * Get doctor by email
     */
    public Optional<Doctor> findDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email);
    }

    /**
     * Delete doctor by ID
     */
    public void deleteDoctorById(Long id) {
        doctorRepository.deleteById(id);
    }

    /**
     * Update doctor profile
     */
    public Doctor updateDoctorProfile(Long doctorId, String specialization, String bio) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            if (specialization != null) doctor.setSpecialization(specialization);
            if (bio != null) doctor.setBio(bio);
            doctor.setUpdatedAt(LocalDateTime.now());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    /**
     * Deactivate doctor (soft delete)
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
}

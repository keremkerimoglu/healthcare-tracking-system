package com.healthcare.service;

import com.healthcare.entity.Patient;
import com.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for Patient entity
 * Handles patient management and profile updates
 */
@Service
@Transactional
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new patient
     */
    public Patient createPatient(Patient patient) {
        if (patient.getPassword() != null && !patient.getPassword().startsWith("$2")) {
            patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        }
        patient.setCreatedAt(LocalDateTime.now());
        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    /**
     * Find patient by ID
     */
    public Optional<Patient> findPatientById(Long id) {
        return patientRepository.findById(id);
    }

    /**
     * Get all patients
     */
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    /**
     * Update patient profile
     */
    public Patient updateProfile(Long patientId, String bloodType, Double height, Double weight, LocalDate birthDate) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            if (bloodType != null) patient.setBloodType(bloodType);
            if (height != null) patient.setHeight(height);
            if (weight != null) patient.setWeight(weight);
            if (birthDate != null) patient.setBirthDate(birthDate);
            patient.setUpdatedAt(LocalDateTime.now());
            return patientRepository.save(patient);
        }
        return null;
    }

    /**
     * Get patient by identity number
     */
    public Optional<Patient> findPatientByIdentityNumber(String identityNumber) {
        return patientRepository.findByIdentityNumber(identityNumber);
    }

    /**
     * Get patient by email
     */
    public Optional<Patient> findPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    /**
     * Delete patient by ID
     */
    public void deletePatientById(Long id) {
        patientRepository.deleteById(id);
    }

    /**
     * Check if patient exists
     */
    public boolean patientExists(Long id) {
        return patientRepository.existsById(id);
    }
}

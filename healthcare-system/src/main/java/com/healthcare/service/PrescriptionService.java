package com.healthcare.service;

import com.healthcare.entity.Appointment;
import com.healthcare.entity.AppointmentStatus;
import com.healthcare.entity.Prescription;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Prescription entity
 * Handles prescription management and creation
 */
@Service
@Transactional
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * Create a new prescription for an appointment and mark it as COMPLETED
     */
    public Prescription createPrescription(Long appointmentId, String medicineList, String dosage) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            
            // Create prescription
            Prescription prescription = new Prescription();
            prescription.setAppointment(appointment);
            prescription.setMedicineList(medicineList);
            prescription.setDosage(dosage);
            prescription.setCreatedAt(new Date());
            
            // Mark appointment as COMPLETED
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);
            
            return prescriptionRepository.save(prescription);
        }
        return null;
    }

    /**
     * Find prescription by ID
     */
    public Optional<Prescription> findPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }

    /**
     * Get all prescriptions
     */
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    /**
     * Get prescriptions by appointment
     */
    public Optional<Prescription> getPrescriptionByAppointment(Long appointmentId) {
        return prescriptionRepository.findAll().stream()
                .filter(p -> p.getAppointment().getId().equals(appointmentId))
                .findFirst();
    }

    /**
     * Get prescriptions for a patient
     */
    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findAll().stream()
                .filter(p -> p.getAppointment().getPatient().getId().equals(patientId))
                .collect(Collectors.toList());
    }

    /**
     * Update prescription
     */
    public Prescription updatePrescription(Long prescriptionId, String medicineList, String dosage) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(prescriptionId);
        if (prescriptionOpt.isPresent()) {
            Prescription prescription = prescriptionOpt.get();
            if (medicineList != null) prescription.setMedicineList(medicineList);
            if (dosage != null) prescription.setDosage(dosage);
            return prescriptionRepository.save(prescription);
        }
        return null;
    }

    /**
     * Delete prescription by ID
     */
    public void deletePrescriptionById(Long id) {
        prescriptionRepository.deleteById(id);
    }
}

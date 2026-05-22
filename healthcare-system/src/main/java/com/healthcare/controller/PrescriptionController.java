package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.PrescriptionRequest;
import com.healthcare.entity.Prescription;
import com.healthcare.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Prescription management
 * Endpoints: /api/prescriptions
 */
@RestController
@RequestMapping("/prescriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    /**
     * Create a new prescription
     * POST /api/prescriptions
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(@RequestBody PrescriptionRequest request) {
        Prescription prescription = prescriptionService.createPrescription(
                request.getAppointmentId(),
                request.getMedicineList(),
                request.getDosage()
        );
        if (prescription != null) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Prescription created successfully", prescription));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Invalid appointment ID"));
    }

    /**
     * Get prescription by ID
     * GET /api/prescriptions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionById(@PathVariable Long id) {
        Optional<Prescription> prescription = prescriptionService.findPrescriptionById(id);
        if (prescription.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Prescription found", prescription.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Prescription not found"));
    }

    /**
     * Get all prescriptions
     * GET /api/prescriptions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Prescription>>> getAllPrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Prescriptions retrieved", prescriptions));
    }

    /**
     * Get prescription by appointment
     * GET /api/prescriptions/appointment/{appointmentId}
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        Optional<Prescription> prescription = prescriptionService.getPrescriptionByAppointment(appointmentId);
        if (prescription.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Prescription found", prescription.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Prescription not found"));
    }

    /**
     * Get prescriptions for a patient
     * GET /api/prescriptions/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Prescription>>> getPatientPrescriptions(@PathVariable Long patientId) {
        List<Prescription> prescriptions = prescriptionService.getPatientPrescriptions(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient prescriptions retrieved", prescriptions));
    }

    /**
     * Update prescription
     * PUT /api/prescriptions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Prescription>> updatePrescription(
            @PathVariable Long id,
            @RequestParam(required = false) String medicineList,
            @RequestParam(required = false) String dosage) {
        
        Prescription updatedPrescription = prescriptionService.updatePrescription(id, medicineList, dosage);
        if (updatedPrescription != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Prescription updated", updatedPrescription));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Prescription not found"));
    }

    /**
     * Delete prescription by ID
     * DELETE /api/prescriptions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePrescription(@PathVariable Long id) {
        if (prescriptionService.findPrescriptionById(id).isPresent()) {
            prescriptionService.deletePrescriptionById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Prescription deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Prescription not found"));
    }
}

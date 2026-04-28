package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.PatientProfileDTO;
import com.healthcare.dto.PatientProfileUpdateRequest;
import com.healthcare.entity.Patient;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Patient management
 * Endpoints: /patients
 */
@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    @Autowired
    private PatientService patientService;

    private final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Create a new patient
     * POST /patients
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PatientProfileDTO>> createPatient(@RequestBody Patient patient) {
        Patient createdPatient = patientService.createPatient(patient);
        PatientProfileDTO dto = convertToDTO(createdPatient);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Patient created successfully", dto));
    }

    /**
     * Get patient by ID
     * GET /patients/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientProfileDTO>> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientService.findPatientById(id);
        if (patient.isPresent()) {
            PatientProfileDTO dto = convertToDTO(patient.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "Patient found", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Patient not found"));
    }

    /**
     * Get all patients
     * GET /patients
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientProfileDTO>>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        List<PatientProfileDTO> dtos = patients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Patients retrieved", dtos));
    }

    /**
     * Update patient profile (YENİ VE DOĞRU METOT)
     * PUT /patients/{id}/profile
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id, 
            @RequestBody PatientProfileUpdateRequest request) {
        try {
            Patient updatedPatient = patientService.updateProfile(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Profiliniz başarıyla güncellendi", updatedPatient));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    /**
     * Delete patient by ID
     * DELETE /patients/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        if (patientService.patientExists(id)) {
            patientService.deletePatientById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Patient deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Patient not found"));
    }

    /**
     * Helper method to convert Patient entity to DTO
     */
    private PatientProfileDTO convertToDTO(Patient patient) {
        PatientProfileDTO dto = new PatientProfileDTO();
        dto.setId(patient.getId());
        dto.setIdentityNumber(patient.getIdentityNumber());
        dto.setEmail(patient.getEmail());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setBloodType(patient.getBloodType());
        dto.setHeight(patient.getHeight());
        dto.setWeight(patient.getWeight());
        if (patient.getBirthDate() != null) {
            dto.setBirthDate(patient.getBirthDate().format(dateFormat));
        }
        return dto;
    }
}
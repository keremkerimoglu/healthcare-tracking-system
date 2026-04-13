package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.PatientProfileDTO;
import com.healthcare.entity.Patient;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Patient management
 * Endpoints: /api/patients
 */
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    @Autowired
    private PatientService patientService;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    /**
     * Create a new patient
     * POST /api/patients
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
     * GET /api/patients/{id}
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
     * GET /api/patients
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
     * Update patient profile
     * PUT /api/patients/{id}/profile
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<PatientProfileDTO>> updatePatientProfile(
            @PathVariable Long id,
            @RequestParam(required = false) String bloodType,
            @RequestParam(required = false) Double height,
            @RequestParam(required = false) Double weight,
            @RequestParam(required = false) String birthDate) {
        
        Date birthDateFormatted = null;
        if (birthDate != null) {
            try {
                birthDateFormatted = dateFormat.parse(birthDate);
            } catch (ParseException e) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Invalid date format. Use yyyy-MM-dd"));
            }
        }

        Patient updatedPatient = patientService.updateProfile(id, bloodType, height, weight, birthDateFormatted);
        if (updatedPatient != null) {
            PatientProfileDTO dto = convertToDTO(updatedPatient);
            return ResponseEntity.ok(new ApiResponse<>(true, "Patient profile updated", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Patient not found"));
    }

    /**
     * Delete patient by ID
     * DELETE /api/patients/{id}
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
        dto.setEmail(patient.getEmail());
        dto.setBloodType(patient.getBloodType());
        dto.setHeight(patient.getHeight());
        dto.setWeight(patient.getWeight());
        if (patient.getBirthDate() != null) {
            dto.setBirthDate(dateFormat.format(patient.getBirthDate()));
        }
        return dto;
    }
}

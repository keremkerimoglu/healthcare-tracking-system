package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.DoctorProfileDTO;
import com.healthcare.entity.Doctor;
import com.healthcare.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Doctor management
 * Endpoints: /api/doctors
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    /**
     * Create a new doctor
     * POST /api/doctors
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> createDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = doctorService.createDoctor(doctor);
        DoctorProfileDTO dto = convertToDTO(createdDoctor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Doctor created successfully", dto));
    }

    /**
     * Get doctor by ID
     * GET /api/doctors/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorService.findDoctorById(id);
        if (doctor.isPresent()) {
            DoctorProfileDTO dto = convertToDTO(doctor.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor found", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Get all doctors
     * GET /api/doctors
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorProfileDTO>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<DoctorProfileDTO> dtos = doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctors retrieved", dtos));
    }

    /**
     * Get doctors by department ID
     * GET /api/doctors/department/{departmentId}
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<DoctorProfileDTO>>> getDoctorsByDepartment(
            @PathVariable Long departmentId) {
        List<Doctor> doctors = doctorService.getDoctorsByDepartmentId(departmentId);
        List<DoctorProfileDTO> dtos = doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Department doctors retrieved", dtos));
    }

    /**
     * Get doctors by specialization
     * GET /api/doctors/specialization/{specialization}
     */
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorProfileDTO>>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<Doctor> doctors = doctorService.getDoctorsBySpecialization(specialization);
        List<DoctorProfileDTO> dtos = doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctors retrieved", dtos));
    }

    /**
     * Update doctor profile
     * PUT /api/doctors/{id}/profile
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> updateDoctorProfile(
            @PathVariable Long id,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String bio) {
        
        Doctor updatedDoctor = doctorService.updateDoctorProfile(id, specialization, bio);
        if (updatedDoctor != null) {
            DoctorProfileDTO dto = convertToDTO(updatedDoctor);
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor profile updated", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Update doctor rating
     * PUT /api/doctors/{id}/rating
     */
    @PutMapping("/{id}/rating")
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> updateDoctorRating(
            @PathVariable Long id,
            @RequestParam Double rating) {
        
        Doctor updatedDoctor = doctorService.updateRating(id, rating);
        if (updatedDoctor != null) {
            DoctorProfileDTO dto = convertToDTO(updatedDoctor);
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor rating updated", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Delete doctor by ID
     * DELETE /api/doctors/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        if (doctorService.findDoctorById(id).isPresent()) {
            doctorService.deleteDoctorById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Deactivate doctor (Soft delete - set isActive to false)
     * PATCH /api/doctors/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> deactivateDoctor(@PathVariable Long id) {
        Doctor deactivatedDoctor = doctorService.deactivateDoctor(id);
        if (deactivatedDoctor != null) {
            DoctorProfileDTO dto = convertToDTO(deactivatedDoctor);
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor deactivated successfully", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Reactivate doctor
     * PATCH /api/doctors/{id}/reactivate
     */
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<ApiResponse<DoctorProfileDTO>> reactivateDoctor(@PathVariable Long id) {
        Doctor reactivatedDoctor = doctorService.reactivateDoctor(id);
        if (reactivatedDoctor != null) {
            DoctorProfileDTO dto = convertToDTO(reactivatedDoctor);
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctor reactivated successfully", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Doctor not found"));
    }

    /**
     * Helper method to convert Doctor entity to DTO
     */
    private DoctorProfileDTO convertToDTO(Doctor doctor) {
        DoctorProfileDTO dto = new DoctorProfileDTO();
        dto.setId(doctor.getId());
        dto.setEmail(doctor.getEmail());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setBio(doctor.getBio());
        dto.setRatingAvg(doctor.getRatingAvg());
        if (doctor.getDepartment() != null) {
            dto.setDepartmentName(doctor.getDepartment().getName());
        }
        return dto;
    }
}

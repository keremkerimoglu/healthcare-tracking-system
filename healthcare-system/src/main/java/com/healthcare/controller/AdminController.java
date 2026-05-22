package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.entity.Admin;
import com.healthcare.entity.Doctor;
import com.healthcare.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Admin management
 * Endpoints: /api/admin
 */
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Create a new admin
     * POST /api/admin
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Admin>> createAdmin(@RequestBody Admin admin) {
        Admin createdAdmin = adminService.createAdmin(admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Admin created successfully", createdAdmin));
    }

    /**
     * Get admin by ID
     * GET /api/admin/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Admin>> getAdminById(@PathVariable Long id) {
        Optional<Admin> admin = adminService.findAdminById(id);
        if (admin.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Admin found", admin.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Admin not found"));
    }

    /**
     * Get all admins
     * GET /api/admin
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Admin>>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(new ApiResponse<>(true, "Admins retrieved", admins));
    }

    /**
     * Add a new doctor (admin only)
     * POST /api/admin/add-doctor
     */
    @PostMapping("/add-doctor")
    public ResponseEntity<ApiResponse<Doctor>> addDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = adminService.addDoctor(doctor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Doctor added successfully", createdDoctor));
    }

    /**
     * View financial reports
     * GET /api/admin/financial-reports
     */
    @GetMapping("/financial-reports")
    public ResponseEntity<ApiResponse<String>> viewFinancialReports() {
        String reports = adminService.viewFinancialReports();
        return ResponseEntity.ok(new ApiResponse<>(true, "Financial reports retrieved", reports));
    }

    /**
     * Monitor system performance
     * GET /api/admin/performance
     */
    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<String>> monitorPerformance() {
        String performance = adminService.monitorPerformance();
        return ResponseEntity.ok(new ApiResponse<>(true, "System performance retrieved", performance));
    }

    /**
     * Delete admin by ID
     * DELETE /api/admin/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(@PathVariable Long id) {
        if (adminService.findAdminById(id).isPresent()) {
            adminService.deleteAdminById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Admin deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Admin not found"));
    }
}

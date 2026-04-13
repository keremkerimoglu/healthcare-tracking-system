package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.entity.Department;
import com.healthcare.entity.Doctor;
import com.healthcare.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Department management
 * Endpoints: /api/departments
 */
@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    /**
     * Create a new department
     * POST /api/departments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Department>> createDepartment(
            @RequestParam String name,
            @RequestParam String description) {
        Department department = departmentService.createDepartment(name, description);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Department created successfully", department));
    }

    /**
     * Get department by ID
     * GET /api/departments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getDepartmentById(@PathVariable Long id) {
        Optional<Department> department = departmentService.findDepartmentById(id);
        if (department.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Department found", department.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Department not found"));
    }

    /**
     * Get all departments
     * GET /api/departments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Departments retrieved", departments));
    }

    /**
     * Get department by name
     * GET /api/departments/name/{name}
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Department>> getDepartmentByName(@PathVariable String name) {
        Optional<Department> department = departmentService.findDepartmentByName(name);
        if (department.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Department found", department.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Department not found"));
    }

    /**
     * Update department
     * PUT /api/departments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description) {
        
        Department updatedDepartment = departmentService.updateDepartment(id, name, description);
        if (updatedDepartment != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Department updated", updatedDepartment));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Department not found"));
    }

    /**
     * Get doctors in a department
     * GET /api/departments/{id}/doctors
     */
    @GetMapping("/{id}/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctorsInDepartment(@PathVariable Long id) {
        List<Doctor> doctors = departmentService.getDoctorsInDepartment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Department doctors retrieved", doctors));
    }

    /**
     * Get doctor count in department
     * GET /api/departments/{id}/doctor-count
     */
    @GetMapping("/{id}/doctor-count")
    public ResponseEntity<ApiResponse<Integer>> getDoctorCountInDepartment(@PathVariable Long id) {
        int count = departmentService.getDoctorCountInDepartment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor count retrieved", count));
    }

    /**
     * Delete department by ID
     * DELETE /api/departments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        if (departmentService.findDepartmentById(id).isPresent()) {
            departmentService.deleteDepartmentById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Department deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Department not found"));
    }
}

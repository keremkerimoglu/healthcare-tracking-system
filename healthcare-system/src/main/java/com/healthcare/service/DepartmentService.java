package com.healthcare.service;

import com.healthcare.entity.Department;
import com.healthcare.entity.Doctor;
import com.healthcare.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Department entity
 * Handles department management and doctor assignments
 */
@Service
@Transactional
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Create a new department
     */
    public Department createDepartment(String name, String description) {
        Department department = new Department();
        department.setName(name);
        department.setDescription(description);
        return departmentRepository.save(department);
    }

    /**
     * Find department by ID
     */
    public Optional<Department> findDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    /**
     * Get all departments
     */
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    /**
     * Find department by name
     */
    public Optional<Department> findDepartmentByName(String name) {
        return departmentRepository.findAll().stream()
                .filter(d -> d.getName().equalsIgnoreCase(name))
                .findFirst();
    }

    /**
     * Update department
     */
    public Department updateDepartment(Long departmentId, String name, String description) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            if (name != null) department.setName(name);
            if (description != null) department.setDescription(description);
            return departmentRepository.save(department);
        }
        return null;
    }

    /**
     * Get doctors in a department
     */
    public List<Doctor> getDoctorsInDepartment(Long departmentId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            return departmentOpt.get().getDoctors();
        }
        return List.of();
    }

    /**
     * Delete department by ID
     */
    public void deleteDepartmentById(Long id) {
        departmentRepository.deleteById(id);
    }

    /**
     * Get number of doctors in department
     */
    public int getDoctorCountInDepartment(Long departmentId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            return departmentOpt.get().getDoctors().size();
        }
        return 0;
    }
}

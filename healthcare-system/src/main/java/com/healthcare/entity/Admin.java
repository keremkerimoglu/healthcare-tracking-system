package com.healthcare.entity;

import jakarta.persistence.*;

/**
 * Admin entity - Extends User
 * Represents an administrator in the healthcare system
 */
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public Admin() {
        super();
    }

    public Admin(String email, String password, Department department) {
        super(email, password, UserRole.ADMIN);
        this.department = department;
    }

    // Methods
    public void addDoctor() {
        // Add doctor logic will be handled by the service layer
    }

    public void viewFinancialReports() {
        // View financial reports logic will be handled by the service layer
    }

    public void monitorPerformance() {
        // Monitor performance logic will be handled by the service layer
    }

    // Getters and Setters
    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}

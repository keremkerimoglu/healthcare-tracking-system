package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Patient entity - Extends User
 * Represents a patient in the healthcare system
 */
@Entity
@DiscriminatorValue("PATIENT")
public class Patient extends User {

    @Column(name = "blood_type", length = 3)
    private String bloodType;

    @Column(name = "height")
    private Double height;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    // Relationships
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks = new ArrayList<>();

    public Patient() {
        super();
    }

    public Patient(String identityNumber, String password, String bloodType, LocalDate birthDate) {
        super(identityNumber, password, UserRole.PATIENT);
        this.bloodType = bloodType;
        this.birthDate = birthDate;
    }

    // Methods
    public void updateProfile(String bloodType, Double height, Double weight) {
        this.bloodType = bloodType;
        this.height = height;
        this.weight = weight;
    }

    public void viewHistory() {
        // Patient can view their appointment and feedback history
        // This will be implemented in the service layer
    }

    // Getters and Setters
    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<Feedback> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<Feedback> feedbacks) {
        this.feedbacks = feedbacks;
    }
}

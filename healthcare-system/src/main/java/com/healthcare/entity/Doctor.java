package com.healthcare.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Doctor entity - Extends User
 * Represents a doctor in the healthcare system
 */
@Entity
@DiscriminatorValue("DOCTOR")
public class Doctor extends User {

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "rating_avg")
    private Double ratingAvg = 0.0;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> takenAppointments = new ArrayList<>();  // Randevuları takıyı (Doktor'un aldığı randevular)

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacksAboutDoctor = new ArrayList<>();  // Hakkındaki yorumlar

    public Doctor() {
        super();
    }

    public Doctor(String email, String password, String specialization, Department department) {
        super(email, password, UserRole.DOCTOR);
        this.specialization = specialization;
        this.department = department;
    }

    // Methods
    public void createPrescription(Appointment appointment) {
        // Prescription creation logic will be handled by the service layer
    }

    public void createAppointment() {
        // Appointment creation logic will be handled by the service layer
    }

    // Getters and Setters
    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Double getRatingAvg() {
        return ratingAvg;
    }

    public void setRatingAvg(Double ratingAvg) {
        this.ratingAvg = ratingAvg;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public List<Appointment> getTakenAppointments() {
        return takenAppointments;
    }

    public void setTakenAppointments(List<Appointment> takenAppointments) {
        this.takenAppointments = takenAppointments;
    }

    public List<Feedback> getFeedbacksAboutDoctor() {
        return feedbacksAboutDoctor;
    }

    public void setFeedbacksAboutDoctor(List<Feedback> feedbacksAboutDoctor) {
        this.feedbacksAboutDoctor = feedbacksAboutDoctor;
    }
}

package com.healthcare.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime dateTime;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    // 🔥 İŞTE YENİ EKLENEN KISIM: Randevu Türü (Yüz Yüze / Online)
    @Column(name = "appointment_type")
    private String appointmentType = "PHYSICAL"; // Varsayılan değer

    // --- YENİ EKLENEN TARİH ALANLARI (Hataları çözen kısım) ---
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- İLİŞKİLER (Döngü Kırıcılar Duruyor) ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnoreProperties({"takenAppointments", "feedbacksAboutDoctor", "department"})
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"appointments", "feedbacks"})
    private Patient patient;

    // --- CONSTRUCTORLAR ---
    
    // 1. Boş Constructor (JPA için şart)
    public Appointment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.appointmentType = "PHYSICAL";
    }

    // 2. Parametreli Constructor (AppointmentService'in aradığı kısım)
    public Appointment(LocalDateTime dateTime, Doctor doctor, Patient patient) {
        this.dateTime = dateTime;
        this.doctor = doctor;
        this.patient = patient;
        this.status = AppointmentStatus.PENDING;
        this.appointmentType = "PHYSICAL";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // --- GETTER & SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getAppointmentType() { return appointmentType; }
    public void setAppointmentType(String appointmentType) { this.appointmentType = appointmentType; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Kayıt güncellenmeden önce tarihi otomatik güncellemek için yardımcı metod
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
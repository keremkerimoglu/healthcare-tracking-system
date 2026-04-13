package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.AppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.AppointmentStatus;
import com.healthcare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Appointment management
 * Endpoints: /api/appointments
 */
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Book a new appointment
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(@RequestBody AppointmentRequest request) {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(request.getDateTime(), dateTimeFormatter);
            
            // Check availability
            if (!appointmentService.isDoctorAvailable(request.getDoctorId(), dateTime)) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Doctor is not available at this time"));
            }
            
            Appointment appointment = appointmentService.bookAppointment(
                    request.getDoctorId(),
                    request.getPatientId(),
                    dateTime,
                    request.getNotes()
            );
            if (appointment != null) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(new ApiResponse<>(true, "Appointment booked successfully", appointment));
            }
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid doctor or patient ID"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid appointment data"));
        }
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.findAppointmentById(id);
        if (appointment.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment found", appointment.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Appointment not found"));
    }

    /**
     * Get all appointments
     * GET /api/appointments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Appointment>>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointments retrieved", appointments));
    }

    /**
     * Get patient's appointment history
     * GET /api/appointments/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getPatientAppointments(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.getPatientAppointmentHistory(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient appointments retrieved", appointments));
    }

    /**
     * Get doctor's appointments
     * GET /api/appointments/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointments(@PathVariable Long doctorId) {
        List<Appointment> appointments = appointmentService.getDoctorAppointments(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor appointments retrieved", appointments));
    }

    /**
     * Get upcoming appointments
     * GET /api/appointments/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Appointment>>> getUpcomingAppointments() {
        List<Appointment> appointments = appointmentService.getUpcomingAppointments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming appointments retrieved", appointments));
    }

    /**
     * Cancel appointment by patient
     * PUT /api/appointments/{id}/cancel-patient
     */
    @PutMapping("/{id}/cancel-patient")
    public ResponseEntity<ApiResponse<Appointment>> cancelAppointmentByPatient(@PathVariable Long id) {
        Appointment appointment = appointmentService.cancelAppointmentByPatient(id);
        if (appointment != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled by patient", appointment));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Appointment not found"));
    }

    /**
     * Cancel appointment by doctor
     * PUT /api/appointments/{id}/cancel-doctor
     */
    @PutMapping("/{id}/cancel-doctor")
    public ResponseEntity<ApiResponse<Appointment>> cancelAppointmentByDoctor(@PathVariable Long id) {
        Appointment appointment = appointmentService.cancelAppointmentByDoctor(id);
        if (appointment != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled by doctor", appointment));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Appointment not found"));
    }

    /**
     * Complete appointment
     * PUT /api/appointments/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Appointment>> completeAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.completeAppointment(id);
        if (appointment != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment completed", appointment));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Appointment not found"));
    }

    /**
     * Delete appointment by ID
     * DELETE /api/appointments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        if (appointmentService.findAppointmentById(id).isPresent()) {
            appointmentService.deleteAppointmentById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Appointment not found"));
    }

    /**
     * Check if doctor is available at specific time
     * GET /api/appointments/doctor/{doctorId}/available?dateTime=2026-04-15T14:00:00
     */
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<ApiResponse<Boolean>> checkDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam String dateTime) {
        try {
            LocalDateTime appointmentDateTime = LocalDateTime.parse(dateTime, dateTimeFormatter);
            boolean available = appointmentService.isDoctorAvailable(doctorId, appointmentDateTime);
            return ResponseEntity.ok(new ApiResponse<>(true, "Availability checked", available));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid date/time format"));
        }
    }

    /**
     * Get available time slots for a doctor on a specific date
     * GET /api/appointments/doctor/{doctorId}/available-slots?date=2026-04-15
     */
    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableTimeSlots(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            LocalDateTime dateTime = localDate.atStartOfDay();
            List<LocalDateTime> slots = appointmentService.getAvailableTimeSlots(doctorId, dateTime);
            List<String> slotStrings = slots.stream()
                    .map(slot -> slot.format(dateTimeFormatter))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Available slots retrieved", slotStrings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid date format"));
        }
    }

    /**
     * Get doctor's today appointments (PENDING status)
     * GET /api/appointments/doctor/{doctorId}/today
     */
    @GetMapping("/doctor/{doctorId}/today")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorTodayAppointments(
            @PathVariable Long doctorId) {
        List<Appointment> appointments = appointmentService.getDoctorTodayAppointments(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Today appointments retrieved", appointments));
    }

    /**
     * Get doctor's appointments by date
     * GET /api/appointments/doctor/{doctorId}/by-date?date=2026-04-15
     */
    @GetMapping("/doctor/{doctorId}/by-date")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointmentsByDate(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            LocalDateTime dateTime = localDate.atStartOfDay();
            List<Appointment> appointments = appointmentService.getDoctorAppointmentsByDate(doctorId, dateTime);
            return ResponseEntity.ok(new ApiResponse<>(true, "Date appointments retrieved", appointments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid date format"));
        }
    }
}

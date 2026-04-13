package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Reports and Statistics
 * Endpoints: /api/reports
 * Provides monthly appointments, department stats, financial summary, and doctor performance
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private AdminService adminService;

    /**
     * Get monthly appointment statistics
     * GET /api/reports/monthly-appointments
     * Returns: { "2026-01": 10, "2026-02": 15, ... }
     */
    @GetMapping("/monthly-appointments")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getMonthlyAppointmentStats() {
        Map<String, Integer> stats = adminService.getMonthlyAppointmentStats();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Monthly appointment statistics retrieved", stats)
        );
    }

    /**
     * Get department-wise appointment statistics (Branş bazlı yoğunluk)
     * GET /api/reports/department-stats
     * Returns: { "Kardiyoloji": 25, "Ruh Sağlığı": 15, ... }
     */
    @GetMapping("/department-stats")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getDepartmentStats() {
        Map<String, Integer> stats = adminService.getDepartmentStats();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Department statistics retrieved", stats)
        );
    }

    /**
     * Get financial summary (Finansal özet)
     * GET /api/reports/financial-summary
     * Returns: { totalRevenue, totalDoctorPayment, netProfit, completedAppointments, ... }
     */
    @GetMapping("/financial-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinancialSummary() {
        Map<String, Object> summary = adminService.getFinancialSummary();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Financial summary retrieved", summary)
        );
    }

    /**
     * Get doctor performance statistics
     * GET /api/reports/doctor-performance
     * Returns: List of { doctorId, doctorEmail, totalAppointments, completedAppointments, averageRating, department }
     */
    @GetMapping("/doctor-performance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDoctorPerformance() {
        List<Map<String, Object>> performance = adminService.getDoctorPerformance();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Doctor performance statistics retrieved", performance)
        );
    }
}

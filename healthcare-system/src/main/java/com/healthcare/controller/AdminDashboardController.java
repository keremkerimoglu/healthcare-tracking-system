package com.healthcare.controller;

import com.healthcare.dto.AdminDashboardDto;
import com.healthcare.dto.ApiResponse;
import com.healthcare.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Admin Dashboard statistics.
 *
 * Base URL (context-path=/api): /api/admin/dashboard
 *
 * Bu controller SADECE okuma (GET) işlemi yapar.
 * Hiçbir mevcut controller veya entity'ye dokunmaz.
 */
@RestController
@RequestMapping("/admin/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    /**
     * Dashboard istatistiklerini döner.
     *
     * GET /api/admin/dashboard
     *
     * @return AdminDashboardDto wrapped inside ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        AdminDashboardDto data = adminDashboardService.getDashboardData();
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard verileri başarıyla getirildi.", data));
    }
}

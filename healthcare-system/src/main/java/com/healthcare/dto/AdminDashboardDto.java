package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Admin Dashboard statistics.
 * Returned by GET /api/admin/dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {

    /** Toplam gelir (tamamlanan randevular × sabit ücret) */
    private double totalRevenue;

    /** Sistemdeki toplam randevu sayısı */
    private long totalAppointments;

    /** Sistemde kayıtlı hekim sayısı */
    private long activeDoctors;

    /** Online randevuların yüzdesi (0-100) */
    private double onlineRatio;

    /** Son 7 güne ait gün-gün randevu ve gelir verileri (Recharts için) */
    private List<DailyStatDto> weeklyTrends;

    /** Poliklinik bazlı tamamlanan randevu/hasta sayısı (Recharts için) */
    private List<DepartmentStatDto> departmentStats;

    // ── İÇ DTO'LAR ─────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStatDto {
        /** Türkçe gün adı kısaltması (Pzt, Sal, …) */
        private String day;

        /** O güne ait toplam randevu sayısı */
        private long appointments;

        /** O güne ait tamamlanan randevuların geliri */
        private double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStatDto {
        /** Poliklinik adı */
        private String department;

        /** O poliklinikte tamamlanan randevu/hasta sayısı */
        private long patientCount;
    }
}

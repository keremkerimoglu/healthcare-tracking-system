package com.healthcare.service;

import com.healthcare.dto.AdminDashboardDto;
import com.healthcare.entity.AppointmentStatus;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for Admin Dashboard statistics.
 * SADECE okuma (read-only) işlemleri yapar; hiçbir veriyi değiştirmez.
 */
@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    /**
     * Sistemde "ücret" alanı olmadığından her tamamlanan randevu için
     * sabit bir muayene ücreti varsayılmaktadır.
     * Gerçek bir ücret alanı Appointment entity'sine eklenirse bu sabit kaldırılır.
     */
    private static final double FEE_PER_APPOINTMENT = 200.0;

    private static final String[] TURKISH_DAY_LABELS = {"Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"};

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Dashboard için tüm istatistikleri hesaplar ve tek bir DTO olarak döner.
     *
     * @return AdminDashboardDto – KPI kartları + haftalık trend + poliklinik dağılımı
     */
    public AdminDashboardDto getDashboardData() {

        // ── 1. KPI Kartları ──────────────────────────────────────────────────

        long totalAppointments = appointmentRepository.count();

        long activeDoctors = doctorRepository.count();

        // Gelir: tamamlanan randevu sayısı × sabit ücret
        long completedCount = appointmentRepository.findByStatus(AppointmentStatus.COMPLETED).size();
        double totalRevenue = completedCount * FEE_PER_APPOINTMENT;

        // Online oran: ONLINE tipi / toplam randevu
        long onlineCount = appointmentRepository.countByAppointmentType("ONLINE");
        double onlineRatio = totalAppointments > 0
                ? Math.round((onlineCount * 100.0 / totalAppointments) * 10.0) / 10.0
                : 0.0;

        // ── 2. Haftalık Trend (Son 7 Gün) ───────────────────────────────────

        List<AdminDashboardDto.DailyStatDto> weeklyTrends = buildWeeklyTrends();

        // ── 3. Poliklinik Dağılımı ───────────────────────────────────────────

        List<AdminDashboardDto.DepartmentStatDto> departmentStats = buildDepartmentStats();

        // ── Sonucu Paketle ───────────────────────────────────────────────────

        return new AdminDashboardDto(
                totalRevenue,
                totalAppointments,
                activeDoctors,
                onlineRatio,
                weeklyTrends,
                departmentStats
        );
    }

    // ── Özel Yardımcı Metodlar ───────────────────────────────────────────────

    /**
     * Bugün dahil son 7 güne ait günlük randevu sayısı ve geliri hesaplar.
     */
    private List<AdminDashboardDto.DailyStatDto> buildWeeklyTrends() {
        List<AdminDashboardDto.DailyStatDto> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd   = date.atTime(23, 59, 59);

            long dayTotal     = appointmentRepository.countByDateTimeBetween(dayStart, dayEnd);
            long dayCompleted = appointmentRepository.countByStatusAndDateTimeBetween(
                    AppointmentStatus.COMPLETED, dayStart, dayEnd);
            double dayRevenue = dayCompleted * FEE_PER_APPOINTMENT;

            String dayLabel = turkishLabel(date.getDayOfWeek());
            trends.add(new AdminDashboardDto.DailyStatDto(dayLabel, dayTotal, dayRevenue));
        }
        return trends;
    }

    /**
     * Poliklinik adı ve tamamlanan randevu sayısını döner.
     */
    private List<AdminDashboardDto.DepartmentStatDto> buildDepartmentStats() {
        List<Object[]> rows = appointmentRepository.countCompletedByDepartment();
        List<AdminDashboardDto.DepartmentStatDto> stats = new ArrayList<>();

        for (Object[] row : rows) {
            String deptName  = row[0] != null ? (String) row[0] : "Bölüm Belirtilmemiş";
            long   count     = ((Number) row[1]).longValue();
            stats.add(new AdminDashboardDto.DepartmentStatDto(deptName, count));
        }
        return stats;
    }

    /**
     * Java'nın DayOfWeek enum'unu Türkçe kısaltmaya çevirir.
     */
    private String turkishLabel(DayOfWeek dow) {
        // DayOfWeek.getValue(): 1=Pzt … 7=Paz
        return TURKISH_DAY_LABELS[dow.getValue() - 1];
    }
}

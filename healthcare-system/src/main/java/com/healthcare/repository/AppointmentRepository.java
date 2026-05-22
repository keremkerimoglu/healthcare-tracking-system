package com.healthcare.repository;

import com.healthcare.entity.Appointment;
import com.healthcare.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ── Mevcut sorgular (dokunulmadı) ────────────────────────────────────────
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByDateTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // ── Dashboard istatistikleri için eklenen sorgular (Read-Only) ───────────

    /**
     * Belirli bir tarih aralığındaki toplam randevu sayısı.
     * Haftalık trend grafiği için gün gün çağrılır.
     */
    long countByDateTimeBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Belirli bir tarih aralığında belirli bir statüdeki randevu sayısı.
     * Günlük tamamlanan randevu / gelir hesabı için kullanılır.
     */
    long countByStatusAndDateTimeBetween(AppointmentStatus status,
                                         LocalDateTime start,
                                         LocalDateTime end);

    /**
     * Belirli bir randevu tipinin (ONLINE / PHYSICAL) toplam sayısı.
     * Online randevu oranı hesabı için kullanılır.
     */
    long countByAppointmentType(String appointmentType);

    /**
     * Poliklinik bazında tamamlanan randevu sayısı.
     * Dönen Object[] dizisinin: [0] = department.name (String), [1] = count (Long)
     */
    @Query("SELECT a.doctor.department.name, COUNT(a) " +
           "FROM Appointment a " +
           "WHERE a.status = 'COMPLETED' " +
             "AND a.doctor.department IS NOT NULL " +
           "GROUP BY a.doctor.department.name " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countCompletedByDepartment();

    /**
     * Belirli bir tarih aralığındaki belirli tipteki randevu sayısı.
     * (İleride kullanılabilecek genişletilmiş sorgu)
     */
    @Query("SELECT COUNT(a) FROM Appointment a " +
           "WHERE a.appointmentType = :type " +
             "AND a.dateTime BETWEEN :start AND :end")
    long countByAppointmentTypeAndDateTimeBetween(@Param("type") String type,
                                                  @Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);
}

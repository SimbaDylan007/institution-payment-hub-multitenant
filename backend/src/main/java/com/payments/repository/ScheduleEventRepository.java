package com.payments.repository;

import com.payments.model.ScheduleEvent;
import com.payments.model.ScheduleEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import com.payments.model.Institution;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {

    @Query("SELECT se FROM ScheduleEvent se WHERE se.startDate >= :start AND se.startDate <= :end")
    List<ScheduleEvent> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByEventType(ScheduleEventType eventType);

    @Query("SELECT se FROM ScheduleEvent se WHERE se.institution.id = :institutionId AND se.startDate >= :start AND se.startDate <= :end")
    List<ScheduleEvent> findByInstitutionIdAndDateRange(
            @Param("institutionId") Long institutionId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // --- ADD THIS NEW METHOD FOR SUPER-ADMIN STATS ---
    long countByInstitutionAndEventType(Institution institution, ScheduleEventType eventType);
}
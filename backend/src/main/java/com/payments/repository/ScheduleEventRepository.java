package com.payments.repository;

import com.payments.model.ScheduleEvent;
import com.payments.model.ScheduleEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {

    @Query("SELECT se FROM ScheduleEvent se WHERE se.startDate >= :start AND se.startDate <= :end")
    List<ScheduleEvent> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByEventType(ScheduleEventType eventType);
}
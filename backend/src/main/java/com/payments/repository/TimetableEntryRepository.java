package com.example.schoolschedule.repository;

import com.example.schoolschedule.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    // You can add custom query methods here if needed, e.g.,
    // List<TimetableEntry> findByDayOfWeek(DayOfWeek dayOfWeek);
}
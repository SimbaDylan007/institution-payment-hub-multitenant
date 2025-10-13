package com.payments.repository;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.DayOfWeek;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
 List<TimetableEntry> findByDayOfWeek(DayOfWeek dayOfWeek);
}
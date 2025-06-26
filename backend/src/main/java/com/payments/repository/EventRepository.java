
package com.payments.repository;

import com.payments.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByEventDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Event> findByCategory(String category);
    
    List<Event> findByStatus(String status);
    
    List<Event> findByOrganizer(String organizer);
    
    @Query("SELECT e FROM Event e WHERE e.eventDate >= :today ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("today") LocalDate today);
    
    @Query("SELECT e FROM Event e WHERE e.eventDate = :date")
    List<Event> findEventsByDate(@Param("date") LocalDate date);
}

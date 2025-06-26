
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
    
    List<Event> findByEventDate(LocalDate eventDate);
    
    List<Event> findByEventDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Event> findByEventType(String eventType);
    
    List<Event> findByTargetAudience(String targetAudience);
    
    List<Event> findByStatus(String status);
    
    List<Event> findByIsPublicTrue();
    
    @Query("SELECT e FROM Event e WHERE e.eventDate >= :date ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("date") LocalDate date);
    
    @Query("SELECT e FROM Event e WHERE e.title LIKE %:keyword% OR e.description LIKE %:keyword%")
    List<Event> searchEvents(@Param("keyword") String keyword);
}

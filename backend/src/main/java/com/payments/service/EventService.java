
package com.payments.service;

import com.payments.model.Event;
import com.payments.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDate.now());
    }
    
    public List<Event> getEventsByType(String eventType) {
        return eventRepository.findByEventType(eventType);
    }
    
    public List<Event> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        return eventRepository.findByEventDateBetween(startDate, endDate);
    }
    
    public List<Event> getPublicEvents() {
        return eventRepository.findByIsPublicTrue();
    }
    
    @Transactional
    public Event createEvent(Event event) {
        if (event.getStatus() == null) {
            event.setStatus("PLANNED");
        }
        return eventRepository.save(event);
    }
    
    @Transactional
    public Event updateEvent(Long id, Event eventDetails) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setEventDate(eventDetails.getEventDate());
            event.setStartTime(eventDetails.getStartTime());
            event.setEndTime(eventDetails.getEndTime());
            event.setVenue(eventDetails.getVenue());
            event.setEventType(eventDetails.getEventType());
            event.setTargetAudience(eventDetails.getTargetAudience());
            event.setOrganizer(eventDetails.getOrganizer());
            event.setStatus(eventDetails.getStatus());
            event.setIsPublic(eventDetails.getIsPublic());
            return eventRepository.save(event);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteEvent(Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<Event> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword);
    }
}

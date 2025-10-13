package com.payments.controller;

import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.ScheduleStatsDto;
import com.payments.model.ScheduleEvent;
import com.payments.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*")
// Updated security to include SUPER_ADMIN
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR', 'TEACHER', 'SUPER_ADMIN')")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping("/events")
    public ResponseEntity<List<ScheduleEvent>> getEvents(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long institutionId) { // <-- Accept optional institutionId
        // Pass institutionId to the service method
        List<ScheduleEvent> events = scheduleService.getEventsForMonth(year, month, institutionId);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/events")
    public ResponseEntity<ScheduleEvent> createOrUpdateEvent(@RequestBody ScheduleEvent event) {
        // The service method is already tenant-aware
        return ResponseEntity.ok(scheduleService.createOrUpdateEvent(event));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            // The service method is already secure via filtered findById
            scheduleService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/timetables/bulk-upload")
    public ResponseEntity<?> bulkImportTimetables(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicYear") String academicYear,
            @RequestParam(required = false) Long institutionId) { // <-- Accept optional institutionId
        try {
            // Pass institutionId to the service method
            scheduleService.bulkImportTimetable(file, academicYear, institutionId);
            return ResponseEntity.ok().body("Timetable imported successfully.");
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ScheduleStatsDto> getScheduleStats(
            @RequestParam(required = false) Long institutionId) { // <-- Accept optional institutionId
        // Pass institutionId to the service method
        return ResponseEntity.ok(scheduleService.getScheduleStats(institutionId));
    }
}
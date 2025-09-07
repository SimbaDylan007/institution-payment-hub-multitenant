package com.payments.controller;

import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.ScheduleEvent;
import com.payments.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import com.payments.dto.ScheduleStatsDto;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR', 'TEACHER')")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping("/events")
    public ResponseEntity<List<ScheduleEvent>> getEvents(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(scheduleService.getEventsForMonth(year, month));
    }

    @PostMapping("/events")
    public ResponseEntity<ScheduleEvent> createOrUpdateEvent(@RequestBody ScheduleEvent event) {
        return ResponseEntity.ok(scheduleService.createOrUpdateEvent(event));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        scheduleService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/timetables/bulk-upload")
    public ResponseEntity<?> bulkImportTimetables(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicYear") String academicYear) {
        try {
            scheduleService.bulkImportTimetable(file, academicYear);
            return ResponseEntity.ok().build();
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ScheduleStatsDto> getScheduleStats() {
        return ResponseEntity.ok(scheduleService.getScheduleStats());
    }
}
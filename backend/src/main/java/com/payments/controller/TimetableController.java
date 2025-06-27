package com.payments.controller;

import com.payments.model.Timetable;
import com.payments.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;  //Import
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/timetables")
@CrossOrigin(origins = "*")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    @GetMapping
    public ResponseEntity<List<Timetable>> getAllTimetables() {
        try {
            List<Timetable> timetables = timetableService.getAllTimetables();
            return ResponseEntity.ok(timetables);
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetables", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Timetable> getTimetableById(@PathVariable Long id) {
        try {
            Optional<Timetable> timetable = timetableService.getTimetableById(id);
            return timetable.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetable with id: " + id, e);
        }

    }

    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Timetable>> getTimetablesByGrade(@PathVariable String grade) {
        try {
            List<Timetable> timetables = timetableService.getTimetablesByGrade(grade);
            return ResponseEntity.ok(timetables);
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetables for grade: " + grade, e);
        }
    }

    @GetMapping("/grade/{grade}/section/{section}")
    public ResponseEntity<List<Timetable>> getTimetablesByGradeAndSection(
            @PathVariable String grade, @PathVariable String section) {
        try {
            List<Timetable> timetables = timetableService.getTimetablesByGradeAndSection(grade, section);
            return ResponseEntity.ok(timetables);
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetables for grade: " + grade + " and section: " + section, e);
        }
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<Timetable>> getTimetablesByDay(@PathVariable String dayOfWeek) {
        try {
            List<Timetable> timetables = timetableService.getTimetablesByDay(dayOfWeek);
            return ResponseEntity.ok(timetables);
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetables for day: " + dayOfWeek, e);
        }
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Timetable>> getTimetablesByTeacher(@PathVariable Long teacherId) {
        try {
            List<Timetable> timetables = timetableService.getTimetablesByTeacher(teacherId);
            return ResponseEntity.ok(timetables);
        } catch (Exception e) {
            //Log the error appropriately
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve timetables for teacher: " + teacherId, e);
        }
    }

    @PostMapping
    public ResponseEntity<Timetable> createTimetable(@RequestBody Timetable timetable) {
        try {
            Timetable createdTimetable = timetableService.createTimetable(timetable);
            return new ResponseEntity<>(createdTimetable, HttpStatus.CREATED); //Return a 201
        } catch (IllegalArgumentException e) {
            //Log the error
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid timetable data", e);
        } catch (Exception e) {
            //Log the error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create timetable", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateTimetable(@PathVariable Long id, @RequestBody Timetable timetable) {
        try {
            Timetable updatedTimetable = timetableService.updateTimetable(id, timetable);
            if (updatedTimetable != null) {
                return ResponseEntity.ok(updatedTimetable);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            //Log the error
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid timetable data", e);
        } catch (Exception e) {
            //Log the error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update timetable with id: " + id, e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        try {
            boolean deleted = timetableService.deleteTimetable(id);
            if (deleted) {
                return ResponseEntity.noContent().build();  // 204 No Content
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            //Log the error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete timetable with id: " + id, e);
        }
    }
}
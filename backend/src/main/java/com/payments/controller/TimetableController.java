
package com.payments.controller;

import com.payments.model.Timetable;
import com.payments.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        List<Timetable> timetables = timetableService.getAllTimetables();
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Timetable> getTimetableById(@PathVariable Long id) {
        Optional<Timetable> timetable = timetableService.getTimetableById(id);
        return timetable.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Timetable>> getTimetablesByGrade(@PathVariable String grade) {
        List<Timetable> timetables = timetableService.getTimetablesByGrade(grade);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/grade/{grade}/section/{section}")
    public ResponseEntity<List<Timetable>> getTimetablesByGradeAndSection(
            @PathVariable String grade, @PathVariable String section) {
        List<Timetable> timetables = timetableService.getTimetablesByGradeAndSection(grade, section);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<Timetable>> getTimetablesByDay(@PathVariable String dayOfWeek) {
        List<Timetable> timetables = timetableService.getTimetablesByDay(dayOfWeek);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Timetable>> getTimetablesByTeacher(@PathVariable Long teacherId) {
        List<Timetable> timetables = timetableService.getTimetablesByTeacher(teacherId);
        return ResponseEntity.ok(timetables);
    }
    
    @PostMapping
    public ResponseEntity<Timetable> createTimetable(@RequestBody Timetable timetable) {
        Timetable createdTimetable = timetableService.createTimetable(timetable);
        return ResponseEntity.ok(createdTimetable);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateTimetable(@PathVariable Long id, @RequestBody Timetable timetable) {
        Timetable updatedTimetable = timetableService.updateTimetable(id, timetable);
        if (updatedTimetable != null) {
            return ResponseEntity.ok(updatedTimetable);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        boolean deleted = timetableService.deleteTimetable(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

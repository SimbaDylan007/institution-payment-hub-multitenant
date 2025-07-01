
package com.payments.controller;

import com.payments.model.Timetable;
import com.payments.model.User;
import com.payments.service.TimetableService;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/timetables")
@CrossOrigin(origins = "*")
public class TimetableController {
    
    @Autowired
    private TimetableService timetableService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<Timetable>> getAllTimetables() {
        List<Timetable> timetables = timetableService.getAllTimetables();
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Timetable> getTimetableById(@PathVariable Long id) {
        Optional<Timetable> timetable = timetableService.getTimetableById(id);
        return timetable.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Timetable> createTimetable(@RequestBody Map<String, Object> timetableData) {
        try {
            Timetable timetable = new Timetable();
            timetable.setSubject((String) timetableData.get("subject"));
            timetable.setGrade((String) timetableData.get("grade"));
            timetable.setSection((String) timetableData.get("section"));
            timetable.setDayOfWeek((String) timetableData.get("dayOfWeek"));
            timetable.setStartTime(java.time.LocalTime.parse((String) timetableData.get("startTime")));
            timetable.setEndTime(java.time.LocalTime.parse((String) timetableData.get("endTime")));
            timetable.setRoom((String) timetableData.get("room"));
            timetable.setAcademicYear((String) timetableData.get("academicYear"));
            
            // Handle teacher - find by username or create new user
            String teacherName = (String) timetableData.get("teacher");
            Optional<User> existingUser = userService.getUserByUsername(teacherName);
            User teacher;
            if (existingUser.isPresent()) {
                teacher = existingUser.get();
            } else {
                // Create new teacher user
                teacher = userService.registerUser(teacherName, "defaultPassword", teacherName + "@school.com");
            }
            timetable.setTeacher(teacher);
            
            Timetable savedTimetable = timetableService.saveTimetable(timetable);
            return ResponseEntity.ok(savedTimetable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateTimetable(@PathVariable Long id, @RequestBody Map<String, Object> timetableData) {
        try {
            Optional<Timetable> existingTimetable = timetableService.getTimetableById(id);
            if (!existingTimetable.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Timetable timetable = existingTimetable.get();
            timetable.setSubject((String) timetableData.get("subject"));
            timetable.setGrade((String) timetableData.get("grade"));
            timetable.setSection((String) timetableData.get("section"));
            timetable.setDayOfWeek((String) timetableData.get("dayOfWeek"));
            timetable.setStartTime(java.time.LocalTime.parse((String) timetableData.get("startTime")));
            timetable.setEndTime(java.time.LocalTime.parse((String) timetableData.get("endTime")));
            timetable.setRoom((String) timetableData.get("room"));
            timetable.setAcademicYear((String) timetableData.get("academicYear"));
            
            // Handle teacher update
            String teacherName = (String) timetableData.get("teacher");
            Optional<User> existingUser = userService.getUserByUsername(teacherName);
            User teacher;
            if (existingUser.isPresent()) {
                teacher = existingUser.get();
            } else {
                teacher = userService.registerUser(teacherName, "defaultPassword", teacherName + "@school.com");
            }
            timetable.setTeacher(teacher);
            
            Timetable savedTimetable = timetableService.saveTimetable(timetable);
            return ResponseEntity.ok(savedTimetable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        boolean deleted = timetableService.deleteTimetable(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Timetable>> getTimetablesByGrade(@PathVariable String grade) {
        List<Timetable> timetables = timetableService.getTimetablesByGrade(grade);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Timetable>> getTimetablesByTeacher(@PathVariable Long teacherId) {
        List<Timetable> timetables = timetableService.getTimetablesByTeacher(teacherId);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTimetableStats() {
        try {
            List<Timetable> allTimetables = timetableService.getAllTimetables();
            Map<String, Object> stats = Map.of(
                "totalClasses", allTimetables.size(),
                "activePeriods", allTimetables.size() * 5, // Mock calculation
                "conflicts", 0,
                "freeSlots", 24
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

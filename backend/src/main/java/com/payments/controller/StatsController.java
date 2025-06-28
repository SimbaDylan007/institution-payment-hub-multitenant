
package com.payments.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StatsController {
    
    @GetMapping("/students/count")
    public ResponseEntity<Map<String, Object>> getStudentCount() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 1250);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/staff/count")
    public ResponseEntity<Map<String, Object>> getStaffCount() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 85);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/library/books/count")
    public ResponseEntity<Map<String, Object>> getLibraryBooksCount() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 15000);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/fees/total-collected")
    public ResponseEntity<Map<String, Object>> getTotalFeesCollected() {
        Map<String, Object> result = new HashMap<>();
        result.put("amount", 2500000.0);
        result.put("currency", "USD");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/events/current-month/count")
    public ResponseEntity<Map<String, Object>> getCurrentMonthEventsCount() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 12);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/timetables/classes/count")
    public ResponseEntity<Map<String, Object>> getTimetableClassesCount() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 42);
        return ResponseEntity.ok(result);
    }
}

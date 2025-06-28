
package com.payments.controller;

import com.payments.model.Exam;
import com.payments.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {
    
    @Autowired
    private ExamService examService;
    
    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = examService.getAllExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Optional<Exam> exam = examService.getExamById(id);
        return exam.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Exam>> getExamsByGrade(@PathVariable String grade) {
        List<Exam> exams = examService.getExamsByGrade(grade);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        List<Exam> exams = examService.getUpcomingExams();
        return ResponseEntity.ok(exams);
    }
    
    @PostMapping
    public ResponseEntity<Exam> scheduleExam(@RequestBody Exam exam) {
        Exam scheduledExam = examService.scheduleExam(exam);
        return ResponseEntity.ok(scheduledExam);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam updatedExam = examService.updateExam(id, exam);
        if (updatedExam != null) {
            return ResponseEntity.ok(updatedExam);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        boolean deleted = examService.deleteExam(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/generate-hall-tickets")
    public ResponseEntity<Map<String, String>> generateHallTickets(@RequestBody Map<String, Object> request) {
        // Implement hall ticket generation logic
        return ResponseEntity.ok(Map.of("message", "Hall tickets generated successfully", "status", "success"));
    }
    
    @PostMapping("/seating-arrangements")
    public ResponseEntity<Map<String, String>> createSeatingArrangements(@RequestBody Map<String, Object> request) {
        // Implement seating arrangement logic
        return ResponseEntity.ok(Map.of("message", "Seating arrangements created successfully", "status", "success"));
    }
}


package com.payments.controller;

import com.payments.model.*;
import com.payments.service.AcademicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "*")
public class AcademicController {
    
    @Autowired
    private AcademicService academicService;
    
    // Subject endpoints
    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = academicService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/subjects/grade/{grade}")
    public ResponseEntity<List<Subject>> getSubjectsByGrade(@PathVariable String grade) {
        List<Subject> subjects = academicService.getSubjectsByGrade(grade);
        return ResponseEntity.ok(subjects);
    }
    
    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        Subject created = academicService.createSubject(subject);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject updated = academicService.updateSubject(id, subject);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Timetable endpoints
    @GetMapping("/timetable/class/{grade}/{section}")
    public ResponseEntity<List<Timetable>> getTimetableByClass(@PathVariable String grade, @PathVariable String section) {
        List<Timetable> timetable = academicService.getTimetableByClass(grade, section);
        return ResponseEntity.ok(timetable);
    }
    
    @GetMapping("/timetable/teacher/{teacherId}")
    public ResponseEntity<List<Timetable>> getTimetableByTeacher(@PathVariable Long teacherId) {
        List<Timetable> timetable = academicService.getTimetableByTeacher(teacherId);
        return ResponseEntity.ok(timetable);
    }
    
    @PostMapping("/timetable")
    public ResponseEntity<Timetable> createTimetableEntry(@RequestBody Timetable timetable) {
        Timetable created = academicService.createTimetableEntry(timetable);
        return ResponseEntity.ok(created);
    }
    
    // Grade endpoints
    @GetMapping("/grades/student/{studentId}")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable Long studentId) {
        List<Grade> grades = academicService.getStudentGrades(studentId);
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/grades/student/{studentId}/year/{academicYear}")
    public ResponseEntity<List<Grade>> getStudentGradesByYear(@PathVariable Long studentId, @PathVariable String academicYear) {
        List<Grade> grades = academicService.getStudentGradesByYear(studentId, academicYear);
        return ResponseEntity.ok(grades);
    }
    
    @PostMapping("/grades")
    public ResponseEntity<Grade> addGrade(@RequestBody Grade grade) {
        Grade created = academicService.addGrade(grade);
        return ResponseEntity.ok(created);
    }
    
    // Exam endpoints
    @GetMapping("/exams/class/{grade}/{section}")
    public ResponseEntity<List<Exam>> getExamsByClass(@PathVariable String grade, @PathVariable String section) {
        List<Exam> exams = academicService.getExamsByClass(grade, section);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/exams/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        List<Exam> exams = academicService.getUpcomingExams();
        return ResponseEntity.ok(exams);
    }
    
    @PostMapping("/exams")
    public ResponseEntity<Exam> scheduleExam(@RequestBody Exam exam) {
        Exam scheduled = academicService.scheduleExam(exam);
        return ResponseEntity.ok(scheduled);
    }
    
    @PutMapping("/exams/{examId}/status")
    public ResponseEntity<Exam> updateExamStatus(@PathVariable Long examId, @RequestParam String status) {
        Exam updated = academicService.updateExamStatus(examId, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}

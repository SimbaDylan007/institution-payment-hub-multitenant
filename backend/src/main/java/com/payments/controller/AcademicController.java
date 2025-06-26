
package com.payments.controller;

import com.payments.model.Exam;
import com.payments.model.Grade;
import com.payments.model.Subject;
import com.payments.service.AcademicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
    
    @GetMapping("/subjects/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        Optional<Subject> subject = academicService.getSubjectById(id);
        return subject.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/subjects/grade/{grade}")
    public ResponseEntity<List<Subject>> getSubjectsByGrade(@PathVariable String grade) {
        List<Subject> subjects = academicService.getSubjectsByGrade(grade);
        return ResponseEntity.ok(subjects);
    }
    
    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        Subject createdSubject = academicService.createSubject(subject);
        return ResponseEntity.ok(createdSubject);
    }
    
    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject updatedSubject = academicService.updateSubject(id, subject);
        if (updatedSubject != null) {
            return ResponseEntity.ok(updatedSubject);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Exam endpoints
    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = academicService.getAllExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/exams/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Optional<Exam> exam = academicService.getExamById(id);
        return exam.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/exams/grade/{grade}")
    public ResponseEntity<List<Exam>> getExamsByGrade(@PathVariable String grade) {
        List<Exam> exams = academicService.getExamsByGrade(grade);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/exams/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        List<Exam> exams = academicService.getUpcomingExams();
        return ResponseEntity.ok(exams);
    }
    
    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        Exam createdExam = academicService.createExam(exam);
        return ResponseEntity.ok(createdExam);
    }
    
    @PutMapping("/exams/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam updatedExam = academicService.updateExam(id, exam);
        if (updatedExam != null) {
            return ResponseEntity.ok(updatedExam);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Grade endpoints
    @GetMapping("/grades")
    public ResponseEntity<List<Grade>> getAllGrades() {
        List<Grade> grades = academicService.getAllGrades();
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/grades/student/{studentId}")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Long studentId) {
        List<Grade> grades = academicService.getGradesByStudent(studentId);
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/grades/student/{studentId}/year/{year}")
    public ResponseEntity<List<Grade>> getGradesByStudentAndYear(@PathVariable Long studentId, @PathVariable String year) {
        List<Grade> grades = academicService.getGradesByStudentAndYear(studentId, year);
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/grades/student/{studentId}/gpa/{year}")
    public ResponseEntity<BigDecimal> getStudentGPA(@PathVariable Long studentId, @PathVariable String year) {
        BigDecimal gpa = academicService.getStudentGPA(studentId, year);
        return ResponseEntity.ok(gpa);
    }
    
    @PostMapping("/grades")
    public ResponseEntity<Grade> createGrade(@RequestBody Grade grade) {
        Grade createdGrade = academicService.createGrade(grade);
        return ResponseEntity.ok(createdGrade);
    }
    
    @PutMapping("/grades/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade grade) {
        Grade updatedGrade = academicService.updateGrade(id, grade);
        if (updatedGrade != null) {
            return ResponseEntity.ok(updatedGrade);
        }
        return ResponseEntity.notFound().build();
    }
}

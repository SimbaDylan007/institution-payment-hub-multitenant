
package com.payments.controller;

import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.GradeDTO;
import com.payments.model.Exam;
import com.payments.model.Grade;
import com.payments.model.Subject;
import com.payments.service.AcademicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    public ResponseEntity<Page<Subject>> getAllSubjects(
            @RequestParam(defaultValue = "All") String grade,
            @RequestParam(defaultValue = "") String searchTerm,
            Pageable pageable) {
        return ResponseEntity.ok(academicService.getAllSubjects(grade, searchTerm, pageable));
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

    @GetMapping("/grades")
    public ResponseEntity<Page<Grade>> getAllGrades(
            @RequestParam(defaultValue = "All") String year,
            @RequestParam(defaultValue = "All") String semester,
            @RequestParam(defaultValue = "All") String letterGrade,
            @RequestParam(defaultValue = "") String searchTerm,
            Pageable pageable) {
        return ResponseEntity.ok(academicService.getAllGrades(year, semester, letterGrade, searchTerm, pageable));
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
    public ResponseEntity<Grade> createGrade(@RequestBody GradeDTO gradeDTO) {
        Grade createdGrade = academicService.createGrade(gradeDTO);
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

    // --- NEW: Bulk Upload Endpoints ---
    @PostMapping("/subjects/bulk-upload")
    public ResponseEntity<?> bulkAddSubjects(@RequestParam("file") MultipartFile file) {
        try {
            List<Subject> subjects = academicService.bulkAddSubjects(file);
            return ResponseEntity.ok(subjects);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/grades/bulk-upload")
    public ResponseEntity<?> bulkAddGrades(@RequestParam("file") MultipartFile file) {
        try {
            List<Grade> grades = academicService.bulkAddGrades(file);
            return ResponseEntity.ok(grades);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        try {
            academicService.deleteGrade(id);
            return ResponseEntity.noContent().build(); // Standard success response for DELETE
        } catch (Exception e) {
            // If the grade doesn't exist, you might want to return a 404
            return ResponseEntity.notFound().build();
        }
    }

    // --- NEW: Add this endpoint to handle DELETE requests for subjects ---
    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            academicService.deleteSubject(id);
            return ResponseEntity.noContent().build(); // Standard success response for DELETE
        } catch (Exception e) {
            // If the subject doesn't exist or cannot be deleted, return an appropriate error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}

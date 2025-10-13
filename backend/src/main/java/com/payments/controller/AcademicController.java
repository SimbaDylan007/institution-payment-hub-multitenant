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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR', 'TEACHER', 'SUPER_ADMIN')")
public class AcademicController {

    @Autowired
    private AcademicService academicService;

    // --- Subject endpoints ---
    @GetMapping("/subjects")
    public ResponseEntity<Page<Subject>> getAllSubjects(
            @RequestParam(defaultValue = "All") String grade,
            @RequestParam(defaultValue = "") String searchTerm,
            @RequestParam(required = false) Long institutionId, // <-- Accept optional institutionId
            Pageable pageable) {
        return ResponseEntity.ok(academicService.getAllSubjects(grade, searchTerm, pageable, institutionId));
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        return academicService.getSubjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/subjects/grade/{grade}")
    public ResponseEntity<List<Subject>> getSubjectsByGrade(@PathVariable String grade) {
        return ResponseEntity.ok(academicService.getSubjectsByGrade(grade));
    }

    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(academicService.createSubject(subject));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        return ResponseEntity.ok(academicService.updateSubject(id, subject));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            academicService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // --- Exam endpoints ---
    @GetMapping("/exams")
    public ResponseEntity<Page<Exam>> getAllExams(
            @RequestParam(required = false) Long institutionId, // <-- Accept optional institutionId
            Pageable pageable) {
        // Pass institutionId to the service method
        return ResponseEntity.ok(academicService.getAllExams(pageable, institutionId));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return academicService.getExamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/exams/grade/{grade}")
    public ResponseEntity<List<Exam>> getExamsByGrade(@PathVariable String grade) {
        return ResponseEntity.ok(academicService.getExamsByGrade(grade));
    }

    @GetMapping("/exams/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        return ResponseEntity.ok(academicService.getUpcomingExams());
    }

    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.ok(academicService.createExam(exam));
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        return ResponseEntity.ok(academicService.updateExam(id, exam));
    }

    // --- Grade endpoints ---
    @GetMapping("/grades")
    public ResponseEntity<Page<Grade>> getAllGrades(
            @RequestParam(defaultValue = "All") String year,
            @RequestParam(defaultValue = "All") String semester,
            @RequestParam(defaultValue = "All") String letterGrade,
            @RequestParam(defaultValue = "") String searchTerm,
            // Add institutionId for super-admin filtering
            @RequestParam(required = false) Long institutionId,
            Pageable pageable) {
        // Pass institutionId to the service method
        return ResponseEntity.ok(academicService.getAllGrades(year, semester, letterGrade, searchTerm, pageable, institutionId));
    }

    @GetMapping("/grades/student/{studentId}")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(academicService.getGradesByStudent(studentId));
    }

    @GetMapping("/grades/student/{studentId}/year/{year}")
    public ResponseEntity<List<Grade>> getGradesByStudentAndYear(@PathVariable Long studentId, @PathVariable String year) {
        return ResponseEntity.ok(academicService.getGradesByStudentAndYear(studentId, year));
    }

    @GetMapping("/grades/student/{studentId}/gpa/{year}")
    public ResponseEntity<BigDecimal> getStudentGPA(@PathVariable Long studentId, @PathVariable String year) {
        return ResponseEntity.ok(academicService.getStudentGPA(studentId, year));
    }

    @PostMapping("/grades")
    public ResponseEntity<Grade> createGrade(@RequestBody GradeDTO gradeDTO) {
        return ResponseEntity.ok(academicService.createGrade(gradeDTO));
    }

    @PutMapping("/grades/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade grade) {
        return ResponseEntity.ok(academicService.updateGrade(id, grade));
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        try {
            academicService.deleteGrade(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- Bulk Upload Endpoints ---
    @PostMapping("/subjects/bulk-upload")
    public ResponseEntity<?> bulkAddSubjects(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long institutionId) { // Super-admin can specify target
        try {
            // Service method needs to accept institutionId
            List<Subject> subjects = academicService.bulkAddSubjects(file, institutionId);
            return ResponseEntity.ok(subjects);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/grades/bulk-upload")
    public ResponseEntity<?> bulkAddGrades(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long institutionId) { // Super-admin can specify target
        try {
            // Service method needs to accept institutionId
            List<Grade> grades = academicService.bulkAddGrades(file, institutionId);
            return ResponseEntity.ok(grades);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
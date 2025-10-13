
package com.payments.controller;

import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.*;
import com.payments.service.EnrollmentService;
import com.payments.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
// Updated security to include SUPER_ADMIN
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN', 'TEACHER', 'SUPER_ADMIN')")
public class StudentManagementController {
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<Page<Student>> getAllStudents(
            Pageable pageable,
            @RequestParam(required = false, defaultValue = "") String searchTerm,
            @RequestParam(required = false) Long institutionId) { // <-- Accept optional institutionId
        // Pass institutionId to the service method
        Page<Student> studentPage = studentService.getAllStudents(pageable, searchTerm, institutionId);
        return ResponseEntity.ok(studentPage);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/student-id/{studentId}")
    public ResponseEntity<Student> getStudentByStudentId(@PathVariable String studentId) {
        Optional<Student> student = studentService.getStudentByStudentId(studentId);
        return student.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Student>> getStudentsByStatus(@PathVariable String status) {
        List<Student> students = studentService.getStudentsByEnrollmentStatus(status);
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Student>> getStudentsByGrade(@PathVariable String grade) {
        List<Student> students = studentService.getStudentsByGrade(grade);
        return ResponseEntity.ok(students);
    }
    
//    @GetMapping("/search")
//    public ResponseEntity<List<Student>> searchStudents(@RequestParam String name) {
//        List<Student> students = studentService.searchStudentsByName(name);
//        return ResponseEntity.ok(students);
//    }
    
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return ResponseEntity.ok(createdStudent);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        Student updatedStudent = studentService.updateStudent(id, student);
        if (updatedStudent != null) {
            return ResponseEntity.ok(updatedStudent);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        boolean deleted = studentService.deleteStudent(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // Use 204 No Content
        }
        return ResponseEntity.notFound().build();
    }
    
    // Guardian endpoints
    @GetMapping("/{studentId}/guardians")
    public ResponseEntity<List<Guardian>> getStudentGuardians(@PathVariable Long studentId) {
        List<Guardian> guardians = studentService.getStudentGuardians(studentId);
        return ResponseEntity.ok(guardians);
    }
    
    @PostMapping("/{studentId}/guardians")
    public ResponseEntity<Guardian> addGuardian(@PathVariable Long studentId, @RequestBody Guardian guardian) {
        Optional<Student> student = studentService.getStudentById(studentId);
        if (student.isPresent()) {
            guardian.setStudent(student.get());
            Guardian createdGuardian = studentService.addGuardian(guardian);
            return ResponseEntity.ok(createdGuardian);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/guardians/{guardianId}")
    public ResponseEntity<Guardian> updateGuardian(@PathVariable Long guardianId, @RequestBody Guardian guardian) {
        Guardian updatedGuardian = studentService.updateGuardian(guardianId, guardian);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Medical records endpoints
    @GetMapping("/{studentId}/medical-records")
    public ResponseEntity<List<MedicalRecord>> getStudentMedicalRecords(@PathVariable Long studentId) {
        List<MedicalRecord> records = studentService.getStudentMedicalRecords(studentId);
        return ResponseEntity.ok(records);
    }
    
    @PostMapping("/{studentId}/medical-records")
    public ResponseEntity<MedicalRecord> addMedicalRecord(@PathVariable Long studentId, @RequestBody MedicalRecord medicalRecord) {
        Optional<Student> student = studentService.getStudentById(studentId);
        if (student.isPresent()) {
            medicalRecord.setStudent(student.get());
            MedicalRecord createdRecord = studentService.addMedicalRecord(medicalRecord);
            return ResponseEntity.ok(createdRecord);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Academic records endpoints
    @GetMapping("/{studentId}/academic-records")
    public ResponseEntity<List<AcademicRecord>> getStudentAcademicRecords(@PathVariable Long studentId) {
        List<AcademicRecord> records = studentService.getStudentAcademicRecords(studentId);
        return ResponseEntity.ok(records);
    }
    
    @PostMapping("/{studentId}/academic-records")
    public ResponseEntity<AcademicRecord> addAcademicRecord(@PathVariable Long studentId, @RequestBody AcademicRecord academicRecord) {
        Optional<Student> student = studentService.getStudentById(studentId);
        if (student.isPresent()) {
            academicRecord.setStudent(student.get());
            AcademicRecord createdRecord = studentService.addAcademicRecord(academicRecord);
            return ResponseEntity.ok(createdRecord);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Enrollment endpoints
    @GetMapping("/{studentId}/enrollments")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(enrollments);
    }
    
    @PostMapping("/{studentId}/enrollments")
    public ResponseEntity<Enrollment> addEnrollment(@PathVariable Long studentId, @RequestBody Enrollment enrollment) {
        Optional<Student> student = studentService.getStudentById(studentId);
        if (student.isPresent()) {
            enrollment.setStudent(student.get());
            Enrollment createdEnrollment = enrollmentService.createEnrollment(enrollment);
            return ResponseEntity.ok(createdEnrollment);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Long> getStudentCount(@RequestParam String status) {
        Long count = studentService.getStudentCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkAddStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long institutionId) { // <-- Accept optional institutionId
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a file!");
        }
        try {
            // Pass institutionId to the service method
            List<Student> savedStudents = studentService.bulkAddStudents(file, institutionId);
            return new ResponseEntity<>(savedStudents, HttpStatus.CREATED);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

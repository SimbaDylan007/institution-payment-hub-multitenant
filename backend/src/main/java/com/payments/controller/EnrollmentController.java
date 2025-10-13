
package com.payments.controller;

import com.payments.model.Enrollment;
import com.payments.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN','SUPER_ADMIN')")
public class EnrollmentController {
    
    @Autowired
    private EnrollmentService enrollmentService;
    
    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long id) {
        Optional<Enrollment> enrollment = enrollmentService.getEnrollmentById(id);
        return enrollment.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/academic-year/{academicYear}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByAcademicYear(@PathVariable String academicYear) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByAcademicYear(academicYear);
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStatus(@PathVariable String status) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStatus(status);
        return ResponseEntity.ok(enrollments);
    }
    
    @PostMapping
    public ResponseEntity<Enrollment> createEnrollment(@RequestBody Enrollment enrollment) {
        Enrollment createdEnrollment = enrollmentService.createEnrollment(enrollment);
        return ResponseEntity.ok(createdEnrollment);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Enrollment> updateEnrollment(@PathVariable Long id, @RequestBody Enrollment enrollment) {
        Enrollment updatedEnrollment = enrollmentService.updateEnrollment(id, enrollment);
        if (updatedEnrollment != null) {
            return ResponseEntity.ok(updatedEnrollment);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        boolean deleted = enrollmentService.deleteEnrollment(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

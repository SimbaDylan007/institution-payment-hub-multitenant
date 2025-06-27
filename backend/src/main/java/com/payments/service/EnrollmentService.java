
package com.payments.service;

import com.payments.model.Enrollment;
import com.payments.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }
    
    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }
    
    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }
    
    public List<Enrollment> getEnrollmentsByAcademicYear(String academicYear) {
        return enrollmentRepository.findByAcademicYear(academicYear);
    }
    
    public List<Enrollment> getEnrollmentsByStatus(String status) {
        return enrollmentRepository.findByEnrollmentStatus(status);
    }
    
    @Transactional
    public Enrollment createEnrollment(Enrollment enrollment) {
        if (enrollment.getEnrollmentDate() == null) {
            enrollment.setEnrollmentDate(LocalDate.now());
        }
        if (enrollment.getEnrollmentStatus() == null) {
            enrollment.setEnrollmentStatus("ACTIVE");
        }
        return enrollmentRepository.save(enrollment);
    }
    
    @Transactional
    public Enrollment updateEnrollment(Long id, Enrollment enrollmentDetails) {
        Optional<Enrollment> optionalEnrollment = enrollmentRepository.findById(id);
        if (optionalEnrollment.isPresent()) {
            Enrollment enrollment = optionalEnrollment.get();
            enrollment.setAcademicYear(enrollmentDetails.getAcademicYear());
            enrollment.setGrade(enrollmentDetails.getGrade());
            enrollment.setSection(enrollmentDetails.getSection());
            enrollment.setEnrollmentStatus(enrollmentDetails.getEnrollmentStatus());
            enrollment.setTransferDate(enrollmentDetails.getTransferDate());
            enrollment.setTransferReason(enrollmentDetails.getTransferReason());
            enrollment.setPreviousSchool(enrollmentDetails.getPreviousSchool());
            enrollment.setComments(enrollmentDetails.getComments());
            return enrollmentRepository.save(enrollment);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteEnrollment(Long id) {
        if (enrollmentRepository.existsById(id)) {
            enrollmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

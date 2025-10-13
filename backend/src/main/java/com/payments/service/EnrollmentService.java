
package com.payments.service;

import com.payments.model.Enrollment;
import com.payments.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.payments.model.Institution;
import com.payments.model.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.payments.repository.UserRepository;
import org.hibernate.Session;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service
public class EnrollmentService {
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

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
        // --- TENANCY ENFORCEMENT ---
        // We ensure the student being enrolled belongs to the current user's institution.
        // The student object must be fetched and set before calling this service.
        if (enrollment.getStudent() == null) {
            throw new IllegalArgumentException("Cannot create an enrollment without a student.");
        }

        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();

        if (institution != null && !institution.getId().equals(enrollment.getStudent().getInstitution().getId())) {
            throw new SecurityException("Cannot enroll a student in a different institution.");
        }

        // Stamp the institution on the enrollment record itself for data integrity.
        enrollment.setInstitution(enrollment.getStudent().getInstitution());

        if (enrollment.getEnrollmentDate() == null) { enrollment.setEnrollmentDate(LocalDate.now()); }
        if (enrollment.getEnrollmentStatus() == null) { enrollment.setEnrollmentStatus("ACTIVE"); }
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

    // --- HELPER METHOD ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
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

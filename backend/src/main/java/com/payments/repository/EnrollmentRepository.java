
package com.payments.repository;

import com.payments.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    List<Enrollment> findByStudentId(Long studentId);
    
    List<Enrollment> findByAcademicYear(String academicYear);
    
    List<Enrollment> findByEnrollmentStatus(String enrollmentStatus);
    
    List<Enrollment> findByGradeAndSection(String grade, String section);
}

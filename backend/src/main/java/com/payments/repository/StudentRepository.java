
package com.payments.repository;

import com.payments.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByStudentId(String studentId);
    
    List<Student> findByEnrollmentStatus(String enrollmentStatus);
    
    List<Student> findByCurrentGrade(String currentGrade);
    
    @Query("SELECT s FROM Student s WHERE s.firstName LIKE %:name% OR s.lastName LIKE %:name%")
    List<Student> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT s FROM Student s WHERE s.currentGrade = :grade AND s.section = :section")
    List<Student> findByGradeAndSection(@Param("grade") String grade, @Param("section") String section);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.enrollmentStatus = :status")
    Long countByEnrollmentStatus(@Param("status") String status);
}

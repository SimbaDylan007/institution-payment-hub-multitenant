
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
    
    List<Student> findByCurrentGradeAndSection(String currentGrade, String section);
    
    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> findByNameContaining(@Param("name") String name);
    
    Long countByEnrollmentStatus(String enrollmentStatus);
    
    Optional<Student> findByEmail(String email);
}

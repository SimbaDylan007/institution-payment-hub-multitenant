
package com.payments.repository;

import com.payments.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.payments.dto.StudentBalanceDto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByStudentId(String studentId);
    
    List<Student> findByEnrollmentStatus(String enrollmentStatus);
    
    List<Student> findByCurrentGrade(String currentGrade);
    
    List<Student> findByCurrentGradeAndSection(String currentGrade, String section);
    
//    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
//    List<Student> findByNameContaining(@Param("name") String name);
    
    Long countByEnrollmentStatus(String enrollmentStatus);
    
    Optional<Student> findByEmail(String email);

    @Query("SELECT new com.payments.dto.StudentBalanceDto(" +
            "s.id, s.studentId, s.firstName, s.lastName, s.currentGrade, " +
            "COALESCE((SELECT SUM(CASE WHEN fl.transactionType = 'DEBIT' THEN fl.amount ELSE -fl.amount END) FROM FinancialLedger fl WHERE fl.student.id = s.id), 0.00)" +
            ") FROM Student s")
    List<StudentBalanceDto> findAllWithBalance();

    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Student> findAllWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

}

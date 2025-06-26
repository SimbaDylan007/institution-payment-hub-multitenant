
package com.payments.repository;

import com.payments.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    List<Exam> findByGradeAndSection(String grade, String section);
    
    List<Exam> findByExamDate(LocalDate examDate);
    
    List<Exam> findByGradeAndSectionAndAcademicYear(String grade, String section, String academicYear);
    
    @Query("SELECT e FROM Exam e WHERE e.examDate BETWEEN :startDate AND :endDate")
    List<Exam> findByExamDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Exam> findByStatus(String status);
}

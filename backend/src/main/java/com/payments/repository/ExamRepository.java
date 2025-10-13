
package com.payments.repository;

import com.payments.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page; // <-- IMPORT
import org.springframework.data.domain.Pageable; // <-- IMPORT

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    List<Exam> findByGrade(String grade);
    
    List<Exam> findBySubjectId(Long subjectId);
    
    List<Exam> findByExamDate(LocalDate examDate);
    
    List<Exam> findByExamDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Exam> findByStatus(String status);
    
    List<Exam> findByExamType(String examType);
    
    @Query("SELECT e FROM Exam e WHERE e.grade = :grade AND e.examDate BETWEEN :startDate AND :endDate")
    List<Exam> findByGradeAndDateRange(@Param("grade") String grade, 
                                       @Param("startDate") LocalDate startDate, 
                                       @Param("endDate") LocalDate endDate);

    Page<Exam> findByInstitutionId(Long institutionId, Pageable pageable);
}

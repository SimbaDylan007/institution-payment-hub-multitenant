
package com.payments.repository;

import com.payments.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    
    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findBySubjectId(Long subjectId);
    
    List<Grade> findByExamId(Long examId);
    
    List<Grade> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    
    List<Grade> findByStudentIdAndSemester(Long studentId, String semester);
    
    List<Grade> findByAssessmentType(String assessmentType);
    
    @Query("SELECT AVG(g.gpa) FROM Grade g WHERE g.student.id = :studentId AND g.academicYear = :academicYear")
    BigDecimal getAverageGPAByStudentAndYear(@Param("studentId") Long studentId, @Param("academicYear") String academicYear);
    
    @Query("SELECT g FROM Grade g WHERE g.student.id = :studentId AND g.subject.id = :subjectId ORDER BY g.recordedDate DESC")
    List<Grade> findByStudentAndSubject(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
}

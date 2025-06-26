
package com.payments.repository;

import com.payments.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    
    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    
    List<Grade> findBySubjectId(Long subjectId);
    
    @Query("SELECT g FROM Grade g WHERE g.student.id = :studentId AND g.subject.id = :subjectId")
    List<Grade> findByStudentIdAndSubjectId(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
    
    @Query("SELECT AVG(g.score) FROM Grade g WHERE g.student.id = :studentId AND g.academicYear = :academicYear")
    Double getAverageScoreByStudentAndYear(@Param("studentId") Long studentId, @Param("academicYear") String academicYear);
}

package com.payments.repository;

import com.payments.model.Grade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT g FROM Grade g JOIN g.student s JOIN g.subject sb WHERE " +
            "(:year = 'All' OR g.academicYear = :year) AND " +
            "(:semester = 'All' OR g.semester = :semester) AND " +
            "(:letterGrade = 'All' OR g.letterGrade = :letterGrade) AND " +
            "(LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(sb.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Grade> findWithFilters(
            @Param("year") String year,
            @Param("semester") String semester,
            @Param("letterGrade") String letterGrade,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

// --- NEW METHOD FOR THE SAFETY CHECK ---
    /**
     * Checks if any Grade records are associated with a given Subject ID.
     * This is a safety check to prevent deleting subjects that are in use.
     * @param subjectId The ID of the Subject to check.
     * @return true if grades exist for this subject, false otherwise.
     */
    boolean existsBySubjectId(Long subjectId);
}
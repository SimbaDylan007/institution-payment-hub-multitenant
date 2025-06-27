package com.payments.repository;

import com.payments.model.AcademicRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {

    List<AcademicRecord> findByStudentId(Long studentId);

    // Get the overall average grade across all records.
    @Query("SELECT AVG(ar.grade) FROM AcademicRecord ar")
    Optional<Double> findOverallAverageGrade();

    // Get a list of [studentId, averageGrade] ordered by performance.
    @Query("SELECT ar.student.id, AVG(ar.grade) as avgGrade FROM AcademicRecord ar GROUP BY ar.student.id ORDER BY avgGrade DESC")
    List<Object[]> findStudentPerformance(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT ar.student.id) FROM AcademicRecord ar GROUP BY ar.student.id HAVING AVG(ar.grade) > :average")
    long countStudentsAboveAverage(@Param("average") double average);

    // Get a list of [subject, averageGrade] ordered by performance.
    @Query("SELECT ar.subject, AVG(ar.grade) as avgGrade FROM AcademicRecord ar GROUP BY ar.subject ORDER BY avgGrade DESC")
    List<Object[]> findSubjectPerformance(Pageable pageable);

    // Count distinct subjects.
    @Query("SELECT COUNT(DISTINCT ar.subject) FROM AcademicRecord ar")
    long countDistinctSubjects();


    // Get the subject grade performance.
    @Query("SELECT ar.subject, AVG(ar.grade) as avgGrade FROM AcademicRecord ar GROUP BY ar.subject ORDER BY avgGrade DESC")
    List<Object[]> findSubjectGradePerformance(Pageable pageable);  // Using "subject" instead of non existing "semester"

    // Count distinct subjects.
    @Query("SELECT COUNT(DISTINCT ar.subject) FROM AcademicRecord ar")
    long countDistinctSubjectsCount(); // Using "subject" instead of non existing "semester"

    @Query("SELECT AVG(ar.attendancePercentage) FROM AcademicRecord ar")
    Optional<Double> findOverallAverageAttendance();


    @Query("SELECT ar.subject, AVG(ar.attendancePercentage) as avgAttendance FROM AcademicRecord ar GROUP BY ar.subject ORDER BY avgAttendance DESC")
    List<Object[]> findSubjectAttendancePerformance(Pageable pageable);  // Using "subject" instead of non existing "semester"
}
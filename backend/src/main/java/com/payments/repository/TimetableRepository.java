package com.payments.repository;

import com.payments.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByGrade(String grade);

    List<Timetable> findByGradeAndSection(String grade, String section);

    List<Timetable> findByDayOfWeek(String dayOfWeek);


    List<Timetable> findByTeacherId(Long teacherId);

    List<Timetable> findBySubjectId(Long subjectId);

    List<Timetable> findByAcademicYear(String academicYear);

    @Query("SELECT COUNT(DISTINCT CONCAT(t.grade, '-', t.section)) FROM Timetable t")
    long countDistinctByGradeAndSection();

    @Query("SELECT COUNT(t) FROM Timetable t WHERE EXISTS (" +
            "SELECT t2 FROM Timetable t2 WHERE t2.id != t.id " +
            "AND t2.dayOfWeek = t.dayOfWeek AND t2.startTime = t.startTime " +
            "AND (t2.teacher.id = t.teacher.id OR t2.room = t.room))") // <-- Corrected here!
    int findConflictCount();
}
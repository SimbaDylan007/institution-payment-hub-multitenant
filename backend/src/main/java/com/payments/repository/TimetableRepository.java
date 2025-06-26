
package com.payments.repository;

import com.payments.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    
    List<Timetable> findByGradeAndSection(String grade, String section);
    
    List<Timetable> findByTeacherId(Long teacherId);
    
    List<Timetable> findByGradeAndSectionAndAcademicYear(String grade, String section, String academicYear);
    
    @Query("SELECT t FROM Timetable t WHERE t.teacher.id = :teacherId AND t.academicYear = :academicYear")
    List<Timetable> findByTeacherIdAndAcademicYear(@Param("teacherId") Long teacherId, @Param("academicYear") String academicYear);
}

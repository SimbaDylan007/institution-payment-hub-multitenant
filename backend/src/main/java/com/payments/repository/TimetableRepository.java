
package com.payments.repository;

import com.payments.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

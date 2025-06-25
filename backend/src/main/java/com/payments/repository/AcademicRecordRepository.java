
package com.payments.repository;

import com.payments.model.AcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {
    
    List<AcademicRecord> findByStudentId(Long studentId);
    
    List<AcademicRecord> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    
    @Query("SELECT ar FROM AcademicRecord ar WHERE ar.student.id = :studentId AND ar.academicYear = :year AND ar.semester = :semester")
    List<AcademicRecord> findByStudentIdAndAcademicYearAndSemester(@Param("studentId") Long studentId, 
                                                                  @Param("year") String academicYear, 
                                                                  @Param("semester") String semester);
}

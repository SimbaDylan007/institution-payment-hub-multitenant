
package com.payments.repository;

import com.payments.model.AcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {
    
    List<AcademicRecord> findByStudentId(Long studentId);
    
    List<AcademicRecord> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    
    List<AcademicRecord> findByStudentIdAndGrade(Long studentId, String grade);
    
    AcademicRecord findByStudentIdAndAcademicYearAndSemester(Long studentId, String academicYear, String semester);
}

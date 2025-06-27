
package com.payments.repository;

import com.payments.model.AcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {
    
    List<AcademicRecord> findByStudentId(Long studentId);
    
    List<AcademicRecord> findByAcademicYear(String academicYear);
    
    List<AcademicRecord> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    
    List<AcademicRecord> findByGradeAndSection(String grade, String section);
}


package com.payments.repository;

import com.payments.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    List<MedicalRecord> findByStudentId(Long studentId);
    
    List<MedicalRecord> findByStudentIdAndRecordType(Long studentId, String recordType);
}

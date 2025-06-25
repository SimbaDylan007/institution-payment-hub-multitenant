
package com.payments.repository;

import com.payments.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    
    List<Guardian> findByStudentId(Long studentId);
    
    List<Guardian> findByStudentIdAndIsPrimary(Long studentId, boolean isPrimary);
    
    List<Guardian> findByStudentIdAndIsEmergencyContact(Long studentId, boolean isEmergencyContact);
}

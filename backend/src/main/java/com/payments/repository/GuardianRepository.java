
package com.payments.repository;

import com.payments.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    
    List<Guardian> findByStudentId(Long studentId);
    
    List<Guardian> findByRelationship(String relationship);
    
    List<Guardian> findByIsPrimaryTrue();
    
    List<Guardian> findByIsEmergencyContactTrue();
    
    List<Guardian> findByStudentIdAndIsPrimaryTrue(Long studentId);
}

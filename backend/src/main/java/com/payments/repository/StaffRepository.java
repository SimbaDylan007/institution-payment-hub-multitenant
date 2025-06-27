
package com.payments.repository;

import com.payments.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    Optional<Staff> findByEmployeeId(String employeeId);
    
    List<Staff> findByDepartment(String department);
    
    List<Staff> findByEmploymentStatus(String employmentStatus);
    
    List<Staff> findByPosition(String position);
    
    Long countByEmploymentStatus(String employmentStatus);
    
    Optional<Staff> findByEmail(String email);
}

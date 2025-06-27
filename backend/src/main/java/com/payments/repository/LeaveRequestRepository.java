
package com.payments.repository;

import com.payments.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByStaffId(Long staffId);
    
    List<LeaveRequest> findByStatus(String status);
    
    List<LeaveRequest> findByLeaveType(String leaveType);
    
    List<LeaveRequest> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<LeaveRequest> findByStaffIdAndStatus(Long staffId, String status);
}

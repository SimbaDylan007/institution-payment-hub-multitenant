
package com.payments.repository;

import com.payments.model.StaffAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, Long> {
    
    List<StaffAttendance> findByStaffId(Long staffId);
    
    List<StaffAttendance> findByAttendanceDate(LocalDate date);
    
    @Query("SELECT sa FROM StaffAttendance sa WHERE sa.staff.id = :staffId AND sa.attendanceDate BETWEEN :startDate AND :endDate")
    List<StaffAttendance> findByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
}

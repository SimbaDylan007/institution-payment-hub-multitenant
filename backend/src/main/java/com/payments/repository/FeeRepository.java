
package com.payments.repository;

import com.payments.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    
    List<Fee> findByStudentId(Long studentId);
    
    List<Fee> findByFeeType(String feeType);
    
    List<Fee> findByStatus(String status);
    
    List<Fee> findByDueDateBefore(LocalDate date);
    
    @Query("SELECT f FROM Fee f WHERE f.student.id = :studentId AND f.status = :status")
    List<Fee> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") String status);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'PAID' AND f.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCollectedBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'PENDING'")
    BigDecimal getTotalPendingAmount();
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'OVERDUE'")
    BigDecimal getTotalOverdueAmount();
}

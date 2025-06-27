
package com.payments.repository;

import com.payments.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime; // <<< ADD THIS IMPORT
import java.util.Optional;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    
    List<Fee> findByStudentId(Long studentId);
    
    List<Fee> findByFeeType(String feeType);
    
    List<Fee> findByStatus(String status);
    
    List<Fee> findByDueDateBefore(LocalDate date);
    
    @Query("SELECT f FROM Fee f WHERE f.student.id = :studentId AND f.status = :status")
    List<Fee> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") String status);
    
    @Query("SELECT SUM(f.paidAmount) FROM Fee f WHERE f.status = 'PAID' AND f.paidDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCollectedBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'PENDING'")
    BigDecimal getTotalPendingAmount();
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'OVERDUE'")
    BigDecimal getTotalOverdueAmount();
    @Query("SELECT SUM(f.amountPaid) FROM Fee f")
    Optional<BigDecimal> findTotalFeesCollected();

    // Sum of outstanding amounts. Assumes Fee has 'amountDue' and 'status' fields.
    @Query("SELECT SUM(f.amountDue) FROM Fee f WHERE f.status = 'DUE'")
    Optional<BigDecimal> findTotalOutstandingFees();

    // Sum of revenue within a specific date range. Assumes 'paymentDate' field.
    @Query("SELECT SUM(f.amountPaid) FROM Fee f WHERE f.paidDate  >= :startDate AND f.paidDate  < :endDate")
    Optional<BigDecimal> findRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

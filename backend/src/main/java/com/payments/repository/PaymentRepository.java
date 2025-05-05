
package com.payments.repository;

import com.payments.model.PaymentAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentAlert, String> {
    List<PaymentAlert> findByStatus(String status);
    
    List<PaymentAlert> findByRegNumber(String regNumber);
    
    List<PaymentAlert> findByStudentNameContainingIgnoreCase(String name);
    
    List<PaymentAlert> findByStudentSurnameContainingIgnoreCase(String surname);
    
    @Query("SELECT p FROM PaymentAlert p WHERE p.amount >= ?1 AND p.amount <= ?2")
    List<PaymentAlert> findByAmountRange(double minAmount, double maxAmount);
    
    @Query("SELECT p FROM PaymentAlert p WHERE p.transactionDate BETWEEN ?1 AND ?2")
    List<PaymentAlert> findByDateRange(String startDate, String endDate);
}

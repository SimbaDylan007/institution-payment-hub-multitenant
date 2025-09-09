
package com.payments.repository;

import com.payments.model.PaymentAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
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

    @Query("SELECT p FROM PaymentAlert p WHERE p.status = :status AND " +
            "(p.studentName LIKE %:searchTerm% OR p.narrative LIKE %:searchTerm% OR p.reference LIKE %:searchTerm%)")
    Page<PaymentAlert> findByStatusWithSearch(String status, String searchTerm, Pageable pageable);

    /**
     * Counts the number of payment alerts with a specific status.
     * This method is used by the DashboardService to show alerts.
     * @param status The status to count (e.g., "PENDING").
     * @return The total count of records with that status.
     */
    long countByStatus(String status);
}

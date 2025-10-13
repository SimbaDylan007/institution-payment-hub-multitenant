package com.payments.repository;

import com.payments.model.FinancialLedger;
import com.payments.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.payments.model.Currency;
import com.payments.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import com.payments.model.Institution;

@Repository
public interface FinancialLedgerRepository extends JpaRepository<FinancialLedger, Long> {

    // --- ADD THIS NEW METHOD ---
    // Efficiently checks if a fee type is in use within a specific institution
    boolean existsByFeeTypeIdAndInstitution(Long feeTypeId, Institution institution);

    // --- Methods for the Financials Page ---
    List<FinancialLedger> findByStudentOrderByTransactionDateAsc(Student student);

    @Query("SELECT fl FROM FinancialLedger fl WHERE fl.student.id = :studentId " +
            "AND (COALESCE(:years, NULL) IS NULL OR fl.academicYear IN (:years)) " +
            "AND (COALESCE(:semesters, NULL) IS NULL OR fl.semester IN (:semesters)) " +
            "ORDER BY fl.transactionDate ASC")
    List<FinancialLedger> findByStudentAndFilter(
            @Param("studentId") Long studentId,
            @Param("years") List<String> years,
            @Param("semesters") List<String> semesters
    );

    @Query("SELECT COALESCE(SUM(CASE WHEN fl.transactionType = 'DEBIT' THEN fl.amount ELSE -fl.amount END), 0) FROM FinancialLedger fl WHERE fl.student.id = :studentId")
    BigDecimal getBalanceForStudent(@Param("studentId") Long studentId);


    // --- Methods needed for StatsController and AnalyticsService ---
    @Query("SELECT SUM(fl.amount) FROM FinancialLedger fl WHERE fl.transactionType = 'CREDIT'")
    Optional<BigDecimal> findTotalFeesCollected();

    @Query("SELECT SUM(CASE WHEN fl.transactionType = 'DEBIT' THEN fl.amount ELSE -fl.amount END) FROM FinancialLedger fl")
    Optional<BigDecimal> findTotalOutstandingFees();

    @Query("SELECT SUM(fl.amount) FROM FinancialLedger fl WHERE fl.transactionType = 'CREDIT' AND fl.transactionDate >= :startDate AND fl.transactionDate <= :endDate")
    Optional<BigDecimal> findRevenueBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


    // --- NEW METHOD FOR THE SAFETY CHECK ---
    /**
     * Efficiently checks if any ledger entry is associated with a given fee type ID.
     * @param feeTypeId The ID of the FeeType to check.
     * @return true if the fee type is in use, false otherwise.
     */
    boolean existsByFeeTypeId(Long feeTypeId);

    // --- NEW: Method to get balances grouped by currency ---
    @Query("SELECT new map(fl.currency as currency, SUM(CASE WHEN fl.transactionType = 'DEBIT' THEN fl.amount ELSE -fl.amount END) as balance) " +
            "FROM FinancialLedger fl WHERE fl.student.id = :studentId GROUP BY fl.currency")
    List<Map<String, Object>> getBalancesByCurrencyForStudent(@Param("studentId") Long studentId);

    // --- NEW METHOD FOR ADVANCED REPORTING ---
    @Query("SELECT fl FROM FinancialLedger fl WHERE fl.student.id = :studentId " +
            "AND fl.currency = :currency " +
            "AND (:#{#academicYear} IS NULL OR fl.academicYear = :academicYear) " +
            "AND (:#{#semester} IS NULL OR fl.semester = :semester) " +
            "ORDER BY fl.transactionDate ASC, fl.id ASC")
    List<FinancialLedger> findFilteredLedgerForStudent(
            @Param("studentId") Long studentId,
            @Param("academicYear") String academicYear,
            @Param("semester") String semester,
            @Param("currency") Currency currency
    );

    // --- NEW METHOD FOR AGGREGATE FINANCIAL REPORTS ---
    @Query("SELECT fl FROM FinancialLedger fl JOIN fl.student s WHERE " +
            "fl.transactionType = :type " +
            "AND (:#{#grade} IS NULL OR :#{#grade} = 'All' OR s.currentGrade = :#{#grade}) " +
            "AND (:#{#feeTypeId} IS NULL OR fl.feeType.id = :#{#feeTypeId}) " +
            "AND (:#{#startDate} IS NULL OR fl.transactionDate >= :#{#startDate}) " +
            "AND (:#{#endDate} IS NULL OR fl.transactionDate <= :#{#endDate}) " +
            "ORDER BY fl.transactionDate DESC")
    List<FinancialLedger> findFinancialsWithFilters(
            @Param("type") TransactionType type,
            @Param("grade") String grade,
            @Param("feeTypeId") Long feeTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // --- NEW METHOD FOR THE FULL LEDGER REPORT ---
    // This query is similar to findFinancialsWithFilters but omits the TransactionType check,
    // so it returns both charges and payments. It's ordered by date to act as a true ledger.
    @Query("SELECT fl FROM FinancialLedger fl JOIN fl.student s WHERE " +
            "(:grade IS NULL OR :grade = 'All' OR s.currentGrade = :#{#grade}) " +
            "AND (:#{#feeTypeId} IS NULL OR fl.feeType.id = :#{#feeTypeId}) " +
            "AND (:#{#startDate} IS NULL OR fl.transactionDate >= :#{#startDate}) " +
            "AND (:#{#endDate} IS NULL OR fl.transactionDate <= :#{#endDate}) " +
            "ORDER BY fl.transactionDate ASC, fl.id ASC")
    List<FinancialLedger> findFullLedgerWithFilters(
            @Param("grade") String grade,
            @Param("feeTypeId") Long feeTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
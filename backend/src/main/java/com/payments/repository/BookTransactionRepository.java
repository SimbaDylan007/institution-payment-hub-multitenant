package com.payments.repository;

import com.payments.model.BookTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookTransactionRepository extends JpaRepository<BookTransaction, Long> {

    List<BookTransaction> findByStudentStudentId(String studentId);

    boolean existsByBookIdAndStatus(Long bookId, String status);

    List<BookTransaction> findByBookIdAndStatus(Long bookId, String status);

    Optional<BookTransaction> findFirstByBookIdAndStudentStudentIdAndStatusOrderByIssueDateDesc(Long bookId, String studentId, String status);

    @Query(value = "SELECT bt FROM BookTransaction bt JOIN FETCH bt.student JOIN FETCH bt.book WHERE " +
            "(:studentId IS NULL OR bt.student.studentId = :studentId) " +
            "ORDER BY bt.issueDate DESC",
            countQuery = "SELECT COUNT(bt) FROM BookTransaction bt WHERE " +
                    "(:studentId IS NULL OR bt.student.studentId = :studentId)")
    Page<BookTransaction> findWithFilters(@Param("studentId") String studentId, Pageable pageable);
}
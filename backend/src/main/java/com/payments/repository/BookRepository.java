
package com.payments.repository;

import com.payments.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    List<Book> findByTitleContainingIgnoreCase(String title);
    
    List<Book> findByAuthorContainingIgnoreCase(String author);
    
    List<Book> findByIsbn(String isbn);
    
    List<Book> findByCategory(String category);
    
    List<Book> findByStatus(String status);
    
    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    List<Book> findAvailableBooks();
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> findAllWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.institution.id = :institutionId AND " +
            "(LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Book> findAllByInstitutionIdAndSearch(@Param("institutionId") Long institutionId, @Param("searchTerm") String searchTerm, Pageable pageable);

    Optional<Book> findByIsbnAndInstitution(String isbn, Institution institution);

}

package com.payments.repository;

import com.payments.model.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
    List<Subject> findByGrade(String grade);
    List<Subject> findByIsActiveTrue();

    // NEW: Paginated search and filter method
    @Query("SELECT s FROM Subject s WHERE " +
            "(:grade = 'All' OR s.grade = :grade) AND " +
            "(LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Subject> findByGradeAndSearchTerm(@Param("grade") String grade, @Param("searchTerm") String searchTerm, Pageable pageable);
}
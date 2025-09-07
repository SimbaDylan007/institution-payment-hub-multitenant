package com.payments.repository;

import com.payments.model.Facility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    /**
     * This single, powerful method replaces all the old findBy... methods.
     * It handles searching by name/location and filtering by status and type,
     * all while supporting pagination to keep your application fast and scalable.
     */
    @Query("SELECT f FROM Facility f WHERE " +
            "(:status IS NULL OR f.status = :status) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:searchTerm IS NULL OR " +
            "    LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "    LOWER(f.location) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Facility> findWithFilters(
            @Param("status") String status,
            @Param("type") String type,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);
}
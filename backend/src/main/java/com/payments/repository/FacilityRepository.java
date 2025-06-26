
package com.payments.repository;

import com.payments.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    
    List<Facility> findByType(String type);
    
    List<Facility> findByStatus(String status);
    
    List<Facility> findByLocation(String location);
    
    List<Facility> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT f FROM Facility f WHERE f.capacity >= :minCapacity")
    List<Facility> findByMinimumCapacity(@Param("minCapacity") Integer minCapacity);
    
    @Query("SELECT COUNT(f) FROM Facility f WHERE f.status = :status")
    Long countByStatus(@Param("status") String status);
}

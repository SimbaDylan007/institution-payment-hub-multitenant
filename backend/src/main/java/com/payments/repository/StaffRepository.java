
package com.payments.repository;

import com.payments.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;


@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    Optional<Staff> findByEmployeeId(String employeeId);
    
    List<Staff> findByDepartment(String department);
    
    List<Staff> findByEmploymentStatus(String employmentStatus);
    
    List<Staff> findByPosition(String position);
    
    Long countByEmploymentStatus(String employmentStatus);
    
    Optional<Staff> findByEmail(String email);

    @Query("SELECT s FROM Staff s WHERE " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.employeeId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.department) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.position) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Staff> findAllWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
}

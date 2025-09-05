
package com.payments.repository;

import com.payments.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByGrade(String grade);

    List<Subject> findByIsActiveTrue();
    
    List<Subject> findByNameContainingIgnoreCase(String name);

    Optional<Subject> findByCode(String code);
}

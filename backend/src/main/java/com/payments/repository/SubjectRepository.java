
package com.payments.repository;

import com.payments.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByGrade(String grade);
    
    List<Subject> findByIsActive(Boolean isActive);
    
    List<Subject> findByGradeAndIsActive(String grade, Boolean isActive);
    
    Subject findByCode(String code);
}

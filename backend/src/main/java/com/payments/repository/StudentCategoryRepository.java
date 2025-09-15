// src/main/java/com/payments/repository/StudentCategoryRepository.java
package com.payments.repository;

import com.payments.model.StudentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentCategoryRepository extends JpaRepository<StudentCategory, Long> {
    // This method is crucial for finding a category by its name (e.g., "DAY", "OTHER")
    Optional<StudentCategory> findByName(String name);
}
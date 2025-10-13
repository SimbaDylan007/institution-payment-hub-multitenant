package com.payments.repository;

import com.payments.model.Institution;
import com.payments.model.StudentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentCategoryRepository extends JpaRepository<StudentCategory, Long> {
    Optional<StudentCategory> findByName(String name);
    boolean existsByInstitutionAndName(Institution institution, String name);

    Optional<StudentCategory> findByNameAndInstitution(String name, Institution institution);

}
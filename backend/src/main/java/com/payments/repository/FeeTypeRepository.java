package com.payments.repository;

import com.payments.model.FeeType;
import com.payments.model.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // <-- IMPORT

public interface FeeTypeRepository extends JpaRepository<FeeType, Long> {
    Optional<FeeType> findByNameAndInstitution(String name, Institution institution);
}
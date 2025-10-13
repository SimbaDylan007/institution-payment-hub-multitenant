package com.payments.repository;

import com.payments.model.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    /**
     * Finds an Institution by its unique name.
     *
     * @param name The name of the institution to find.
     * @return An Optional containing the Institution if found, otherwise empty.
     */
    Optional<Institution> findByName(String name);

}
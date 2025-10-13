package com.payments.repository;

import com.payments.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.payments.model.Institution;
import java.util.Optional;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {

    Optional<SystemSettings> findByInstitution(Institution institution);
    Optional<SystemSettings> findByInstitutionId(Long institutionId);
}
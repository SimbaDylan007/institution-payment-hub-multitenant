package com.payments.repository;

import com.payments.model.SystemPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemPreferencesRepository extends JpaRepository<SystemPreferences, Long> {
}
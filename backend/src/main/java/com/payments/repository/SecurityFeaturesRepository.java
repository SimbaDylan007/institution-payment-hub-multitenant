package com.payments.repository;

import com.payments.model.SecurityFeatures;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityFeaturesRepository extends JpaRepository<SecurityFeatures, Long> {
}
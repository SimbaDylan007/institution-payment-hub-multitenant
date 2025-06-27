package com.payments.repository;

import com.payments.model.SchoolInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolInformationRepository extends JpaRepository<SchoolInformation, Long> {
}
package com.payments.repository;

import com.payments.model.InstitutionAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionAccountRepository extends JpaRepository<InstitutionAccount, Long> {
    // You might want to find an account by its institutionId (if it's unique per user/context)
    Optional<InstitutionAccount> findByInstitutionId(String institutionId);
}
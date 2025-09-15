package com.payments.service;

import com.payments.model.InstitutionAccount;
import com.payments.repository.InstitutionAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InstitutionAccountService {

    @Autowired
    private InstitutionAccountRepository accountRepository;

    public List<InstitutionAccount> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<InstitutionAccount> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public InstitutionAccount addAccount(InstitutionAccount account) {
        // Here you might want to check for duplicates based on institutionId or a combination
        // For now, we'll just save it. If institutionId should be unique, you'd add logic here.
        return accountRepository.save(account);
    }

    public InstitutionAccount updateAccount(InstitutionAccount account) {
        // Ensure the account exists before updating
        if (account.getId() == null || !accountRepository.existsById(account.getId())) {
            throw new IllegalArgumentException("Account with ID " + account.getId() + " not found for update.");
        }
        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    public Optional<InstitutionAccount> getAccountByInstitutionId(String institutionId) {
        return accountRepository.findByInstitutionId(institutionId);
    }
}
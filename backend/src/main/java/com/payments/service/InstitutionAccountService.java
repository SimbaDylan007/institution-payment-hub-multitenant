package com.payments.service;

import com.payments.dto.InstitutionAccountDto;
import com.payments.dto.InstitutionDto;
import com.payments.model.InstitutionAccount;
import com.payments.repository.InstitutionAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InstitutionAccountService {

    @Autowired
    private InstitutionAccountRepository accountRepository;

    public List<InstitutionAccountDto> getAllAccountsAsDto() {
        // Fetch all account entities from the database
        List<InstitutionAccount> accounts = accountRepository.findAll();
        // Convert each entity to its corresponding DTO
        return accounts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- NEW HELPER METHOD FOR CONVERSION ---
    private InstitutionAccountDto convertToDto(InstitutionAccount account) {
        InstitutionAccountDto accountDto = new InstitutionAccountDto();
        accountDto.setId(account.getId());
        accountDto.setInstitutionId(account.getInstitutionId());
        accountDto.setAccountName(account.getAccountName());

        // This is the crucial part: check if the institution exists and create the nested DTO
        if (account.getInstitution() != null) {
            InstitutionDto instDto = new InstitutionDto();
            instDto.setId(account.getInstitution().getId());
            instDto.setName(account.getInstitution().getName());
            instDto.setAddress(account.getInstitution().getAddress());
            instDto.setSchoolEmail(account.getInstitution().getSchoolEmail());
            accountDto.setInstitution(instDto);
        }
        return accountDto;
    }

    // --- EXISTING METHODS (UNCHANGED) ---
    public List<InstitutionAccount> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<InstitutionAccount> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public InstitutionAccount addAccount(InstitutionAccount account) {
        return accountRepository.save(account);
    }

    public InstitutionAccount updateAccount(InstitutionAccount account) {
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
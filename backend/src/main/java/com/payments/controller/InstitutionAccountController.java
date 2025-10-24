package com.payments.controller;

import com.payments.dto.InstitutionAccountDto;
import com.payments.model.InstitutionAccount;
import com.payments.service.InstitutionAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN','SUPER_ADMIN')")
public class InstitutionAccountController {

    @Autowired
    private InstitutionAccountService accountService;


    @GetMapping
    public ResponseEntity<List<InstitutionAccountDto>> getAllAccounts() {
        List<InstitutionAccountDto> accounts = accountService.getAllAccountsAsDto();
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    public ResponseEntity<InstitutionAccount> addOrUpdateAccount(@RequestBody InstitutionAccount account) {
        Optional<InstitutionAccount> existingAccount = accountService.getAccountByInstitutionId(account.getInstitutionId());

        if (existingAccount.isPresent()) {
            InstitutionAccount accountToUpdate = existingAccount.get();
            accountToUpdate.setAccountName(account.getAccountName());
            InstitutionAccount updated = accountService.updateAccount(accountToUpdate);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } else {
            InstitutionAccount newAccount = accountService.addAccount(account);
            return new ResponseEntity<>(newAccount, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
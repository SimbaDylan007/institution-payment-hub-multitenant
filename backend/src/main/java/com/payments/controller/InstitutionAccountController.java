package com.payments.controller;

import com.payments.config.CustomUserDetails;
import com.payments.dto.InstitutionAccountDto;
import com.payments.model.Institution;
import com.payments.model.InstitutionAccount;
import com.payments.repository.InstitutionRepository;
import com.payments.service.InstitutionAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN','SUPER_ADMIN')")
public class InstitutionAccountController {

    @Autowired
    private InstitutionAccountService accountService;

    @Autowired
    private InstitutionRepository institutionRepository;

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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();

            if (!(principal instanceof CustomUserDetails)) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not determine user's institution.");
            }

            Institution currentUserInstitution = ((CustomUserDetails) principal).getInstitution();

            if (currentUserInstitution == null) {
              
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create an account without a parent institution.");
            }

            account.setInstitution(currentUserInstitution);

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
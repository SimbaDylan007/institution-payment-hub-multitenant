package com.payments.controller;


import com.payments.model.InstitutionAccount;
import com.payments.service.InstitutionAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;



import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN')")// Allow your React app to access this
public class InstitutionAccountController {

    @Autowired
    private InstitutionAccountService accountService;

    // GET all accounts
    @GetMapping
    public List<InstitutionAccount> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    // POST a new account or update an existing one based on institutionId
    @PostMapping
    public ResponseEntity<InstitutionAccount> addOrUpdateAccount(@RequestBody InstitutionAccount account) {
        // If an account with the same institutionId already exists, update it
        // Otherwise, create a new one.
        // Note: The 'id' in your frontend was 'institutionId', which is a string.
        // The backend's primary key 'id' is a Long.
        // For simplicity, let's assume if institutionId matches, we update.
        // If you want true separate add/update, you'd need more logic or separate endpoints.

        Optional<InstitutionAccount> existingAccount = accountService.getAccountByInstitutionId(account.getInstitutionId());

        if (existingAccount.isPresent()) {
            InstitutionAccount accountToUpdate = existingAccount.get();
            accountToUpdate.setAccountName(account.getAccountName()); // Update other fields as needed
            InstitutionAccount updated = accountService.updateAccount(accountToUpdate);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } else {
            InstitutionAccount newAccount = accountService.addAccount(account);
            return new ResponseEntity<>(newAccount, HttpStatus.CREATED);
        }
    }

    // DELETE an account by its primary key ID (the Long id)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
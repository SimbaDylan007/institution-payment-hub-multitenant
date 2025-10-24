package com.payments.controller;

import com.payments.dto.MultiPickPaymentRequest;
import com.payments.dto.PaymentAlertDto;
import com.payments.service.ZbApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN','SUPER_ADMIN')")
public class PaymentController {

    @Autowired
    private ZbApiService zbApiService;

    // No longer need direct repository access, which is a good practice.
    // @Autowired
    // private PaymentRepository paymentRepository;

    @PostMapping("/pick-multiple-pending")
    public ResponseEntity<List<PaymentAlertDto>> pickMultiplePending(@RequestBody MultiPickPaymentRequest request) {
        List<PaymentAlertDto> payments = zbApiService.pickPaymentsForMultipleAccounts(request.getInstitutionIds(), "pending");
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/get-multiple-all")
    public ResponseEntity<List<PaymentAlertDto>> getMultipleAll(@RequestBody MultiPickPaymentRequest request) {
        List<PaymentAlertDto> payments = zbApiService.pickPaymentsForMultipleAccounts(request.getInstitutionIds(), "all");
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentAlertDto>> getPaymentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(zbApiService.getPaymentsByStatus(status));
    }

    @GetMapping("/local")
    public ResponseEntity<List<PaymentAlertDto>> getLocalPayments() {
        // This is now secure and multitenant
        return ResponseEntity.ok(zbApiService.getPaymentsByStatus("PENDING"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentAlertDto> getPaymentById(@PathVariable String id) {
        // Call the new secure service method
        return zbApiService.getPaymentByIdForCurrentUser(id)
                .map(ResponseEntity::ok) // If found and authorized, return 200 OK with the DTO
                .orElseGet(() -> ResponseEntity.notFound().build()); // Otherwise, return 404 Not Found
    }

    @GetMapping("/reset/{id}")
    public ResponseEntity<Boolean> resetPayment(@PathVariable String id) {
        boolean success = zbApiService.resetPayment(id);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    @PostMapping("/reset-all")
    public ResponseEntity<String> resetAllPayments() {
        boolean success = zbApiService.resetAllPayments();
        if (success) {
            return ResponseEntity.ok("All payments have been successfully reset to pending.");
        } else {
            return ResponseEntity.status(500).body("A server error occurred while trying to reset all payments.");
        }
    }
}
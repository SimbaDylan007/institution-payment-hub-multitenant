package com.payments.controller;

import com.payments.dto.MultiPickPaymentRequest;
import com.payments.model.PaymentAlert;
import com.payments.repository.PaymentRepository;
import com.payments.service.ZbApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN','SUPER_ADMIN')")
public class PaymentController {

    @Autowired
    private ZbApiService zbApiService;

    @Autowired
    private PaymentRepository paymentRepository;

    // --- SECURE MULTI-ACCOUNT ENDPOINTS ---
    @PostMapping("/pick-multiple-pending")
    public ResponseEntity<List<PaymentAlert>> pickMultiplePending(@RequestBody MultiPickPaymentRequest request) {
        List<PaymentAlert> payments = zbApiService.pickPaymentsForMultipleAccounts(request.getInstitutionIds(), "pending");
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/get-multiple-all")
    public ResponseEntity<List<PaymentAlert>> getMultipleAll(@RequestBody MultiPickPaymentRequest request) {
        List<PaymentAlert> payments = zbApiService.pickPaymentsForMultipleAccounts(request.getInstitutionIds(), "all");
        return ResponseEntity.ok(payments);
    }

    // --- UTILITY AND DATA-ACCESS ENDPOINTS ---
    @GetMapping("/reset/{id}")
    public ResponseEntity<Boolean> resetPayment(@PathVariable String id) {
        boolean success = zbApiService.resetPayment(id);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    @GetMapping("/local")
    public ResponseEntity<List<PaymentAlert>> getLocalPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentAlert> getPaymentById(@PathVariable String id) {
        return paymentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentAlert>> getPaymentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(zbApiService.getPaymentsByStatus(status));
    }

    // --- NEW ENDPOINT FOR BULK RESET ---
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
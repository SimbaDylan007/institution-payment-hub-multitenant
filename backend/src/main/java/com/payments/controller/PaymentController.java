package com.payments.controller;

import com.payments.dto.MultiPickPaymentRequest;
import com.payments.dto.PaymentAlertDto;
import com.payments.model.PaymentAlert;
import com.payments.repository.PaymentRepository;
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

    @Autowired
    private PaymentRepository paymentRepository;

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
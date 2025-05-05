
package com.payments.controller;

import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.PaymentRepository;
import com.payments.service.ZbApiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*") // Allow requests from the frontend
public class PaymentController {

    @Autowired
    private ZbApiService zbApiService;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/pick-all-pending")
    public ResponseEntity<List<PaymentAlert>> pickAllPendingPayments(@RequestBody PickPaymentRequest request) {
        List<PaymentAlert> payments = zbApiService.pickAllPendingPayments(request);
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/all-payments")
    public ResponseEntity<List<PaymentAlert>> getAllPayments(@RequestBody PickPaymentRequest request) {
        List<PaymentAlert> payments = zbApiService.getAllPayments(request);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/reset/{id}")
    public ResponseEntity<Boolean> resetPayment(@PathVariable String id) {
        boolean success = zbApiService.resetPayment(id);
        if (success) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.badRequest().body(false);
        }
    }
    
    // Fallback method to get payments from local database
    @GetMapping("/local")
    public ResponseEntity<List<PaymentAlert>> getLocalPayments() {
        List<PaymentAlert> payments = paymentRepository.findAll();
        return ResponseEntity.ok(payments);
    }
}

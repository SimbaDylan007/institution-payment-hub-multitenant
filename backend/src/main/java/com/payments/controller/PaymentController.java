
package com.payments.controller;

import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.PaymentRepository;
import com.payments.service.ZbApiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        try {
            List<PaymentAlert> payments = zbApiService.pickAllPendingPayments(request);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error in pickAllPendingPayments endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/all-payments")
    public ResponseEntity<List<PaymentAlert>> getAllPayments(@RequestBody PickPaymentRequest request) {
        try {
            List<PaymentAlert> payments = zbApiService.getAllPayments(request);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error in getAllPayments endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
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
        try {
            List<PaymentAlert> payments = paymentRepository.findAll();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error in getLocalPayments endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get a payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentAlert> getPaymentById(@PathVariable String id) {
        try {
            Optional<PaymentAlert> payment = paymentRepository.findById(id);
            return payment.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getPaymentById endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get payments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentAlert>> getPaymentsByStatus(@PathVariable String status) {
        try {
            List<PaymentAlert> payments = zbApiService.getPaymentsByStatus(status);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error in getPaymentsByStatus endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

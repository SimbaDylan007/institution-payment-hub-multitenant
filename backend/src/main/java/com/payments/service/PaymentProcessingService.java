
package com.payments.service;

import com.payments.model.PaymentAlert;
import com.payments.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentProcessingService {

    @Autowired
    private PaymentRepository paymentRepository;
    
    public List<PaymentAlert> processAndSavePayments(List<PaymentAlert> payments) {
        // Apply any business logic or transformations here before saving
        return payments.stream()
                .map(this::enrichPayment)
                .collect(Collectors.toList());
    }
    
    public PaymentAlert enrichPayment(PaymentAlert payment) {
        // Add additional processing logic if needed
        return payment;
    }
    
    public List<PaymentAlert> findAllPayments() {
        return paymentRepository.findAll();
    }
    
    public Optional<PaymentAlert> findPaymentById(String id) {
        return paymentRepository.findById(id);
    }
    
    public List<PaymentAlert> findPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }
    
    public PaymentAlert savePayment(PaymentAlert payment) {
        return paymentRepository.save(payment);
    }
    
    public void deletePayment(String id) {
        paymentRepository.deleteById(id);
    }
}

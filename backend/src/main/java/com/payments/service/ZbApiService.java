
package com.payments.service;

import com.payments.model.ErrorDetails;
import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ZbApiService {

    @Value("${zb.api.base-url}")
    private String apiBaseUrl;

    @Value("${zb.api.pick-pending-path}")
    private String pickPendingPath;

    @Value("${zb.api.all-payments-path}")
    private String allPaymentsPath;

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private PaymentRepository paymentRepository;

    public List<PaymentAlert> pickAllPendingPayments(PickPaymentRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PickPaymentRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(
                apiBaseUrl + pickPendingPath,
                HttpMethod.POST,
                entity,
                PaymentAlert[].class
            );
            
            List<PaymentAlert> payments = Arrays.asList(response.getBody());
            
            // Process and enhance payments with derived data
            List<PaymentAlert> enhancedPayments = payments.stream()
                .map(this::extractStudentInfo)
                .collect(Collectors.toList());
            
            // Save to database
            paymentRepository.saveAll(enhancedPayments);
            
            return enhancedPayments;
        } catch (HttpClientErrorException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            throw new RuntimeException("API Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.err.println("Error picking pending payments: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error picking pending payments", e);
        }
    }

    public List<PaymentAlert> getAllPayments(PickPaymentRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PickPaymentRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(
                apiBaseUrl + allPaymentsPath,
                HttpMethod.POST,
                entity,
                PaymentAlert[].class
            );
            
            List<PaymentAlert> payments = Arrays.asList(response.getBody());
            
            // Process and enhance payments with derived data
            List<PaymentAlert> enhancedPayments = payments.stream()
                .map(this::extractStudentInfo)
                .collect(Collectors.toList());
                
            // Save to database
            paymentRepository.saveAll(enhancedPayments);
            
            return enhancedPayments;
        } catch (HttpClientErrorException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            throw new RuntimeException("API Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.err.println("Error getting all payments: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error getting all payments", e);
        }
    }
    
    // Helper method to extract student information from narrative
    private PaymentAlert extractStudentInfo(PaymentAlert payment) {
        // Extract student info from narrative or nr1 field
        if (payment.getNarrative() != null) {
            String[] parts = payment.getNarrative().split("\\|");
            if (parts.length >= 3) {
                String studentFullName = payment.getNr1() != null ? payment.getNr1() : 
                                         parts.length > 2 ? parts[2] : "";
                String[] nameParts = studentFullName.trim().split(" ");
                
                if (nameParts.length > 0) {
                    // Last part as surname, rest as first name
                    payment.setStudentSurname(nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
                    payment.setStudentName(nameParts.length > 1 ? 
                            String.join(" ", Arrays.copyOfRange(nameParts, 0, nameParts.length - 1)) : nameParts[0]);
                }
            }
        }
        
        // Use reference as registration number
        if (payment.getReference() != null) {
            payment.setRegNumber(payment.getReference());
        }
        
        return payment;
    }
    
    // Method to reset a payment
    public boolean resetPayment(String paymentId) {
        try {
            Optional<PaymentAlert> paymentOptional = paymentRepository.findById(paymentId);
            
            if (paymentOptional.isPresent()) {
                PaymentAlert payment = paymentOptional.get();
                payment.setPicked(0);
                payment.setStatus("pending");
                paymentRepository.save(payment);
                return true;
            } else {
                System.err.println("Payment not found with id: " + paymentId);
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error resetting payment: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Method to get payments by status
    public List<PaymentAlert> getPaymentsByStatus(String status) {
        try {
            return paymentRepository.findByStatus(status);
        } catch (Exception e) {
            System.err.println("Error getting payments by status: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}

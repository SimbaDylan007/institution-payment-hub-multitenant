package com.payments.service;

import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;
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

    @Autowired
    private Environment env;

    public List<PaymentAlert> pickAllPendingPayments(PickPaymentRequest request) {
        try {
            HttpEntity<PickPaymentRequest> entity = createRequestEntity(request);

            ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(
                    apiBaseUrl + pickPendingPath, HttpMethod.POST, entity, PaymentAlert[].class);

            List<PaymentAlert> payments = Optional.ofNullable(response.getBody()).map(Arrays::asList).orElse(Collections.emptyList());
            return processAndSavePayments(payments);

        } catch (HttpClientErrorException e) {
            System.err.println("API Error picking pending payments: " + e.getResponseBodyAsString());
            throw new RuntimeException("API Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.err.println("Error picking pending payments: " + e.getMessage());
            throw new RuntimeException("Error picking pending payments", e);
        }
    }

    public List<PaymentAlert> getAllPayments(PickPaymentRequest request) {
        try {
            HttpEntity<PickPaymentRequest> entity = createRequestEntity(request);

            ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(
                    apiBaseUrl + allPaymentsPath, HttpMethod.POST, entity, PaymentAlert[].class);

            List<PaymentAlert> payments = Optional.ofNullable(response.getBody()).map(Arrays::asList).orElse(Collections.emptyList());
            return processAndSavePayments(payments);

        } catch (HttpClientErrorException e) {
            System.err.println("API Error getting all payments: " + e.getResponseBodyAsString());
            throw new RuntimeException("API Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.err.println("Error getting all payments: " + e.getMessage());
            throw new RuntimeException("Error getting all payments", e);
        }
    }

    public List<PaymentAlert> pickPaymentsForMultipleAccounts(List<String> institutionIds, String type) {
        List<PaymentAlert> allPayments = new ArrayList<>();
        for (String id : institutionIds) {
            String password = env.getProperty("zb.api.credentials." + id);

            if (password == null) {
                System.err.println("WARN: No password configured for institution ID: " + id);
                continue;
            }

            PickPaymentRequest request = new PickPaymentRequest();
            request.setInstitutionId(id);
            request.setPassword(password);

            try {
                if ("all".equals(type)) {
                    allPayments.addAll(this.getAllPayments(request));
                } else {
                    allPayments.addAll(this.pickAllPendingPayments(request));
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch payments for " + id + ": " + e.getMessage());
            }
        }

        return allPayments.stream()
                .filter(p -> p.getId() != null)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(PaymentAlert::getId, p -> p, (p1, p2) -> p1),
                        map -> new ArrayList<>(map.values())
                ));
    }

    private List<PaymentAlert> processAndSavePayments(List<PaymentAlert> payments) {
        List<PaymentAlert> enhancedPayments = payments.stream()
                .map(this::extractStudentInfo)
                .collect(Collectors.toList());
        paymentRepository.saveAll(enhancedPayments);
        return enhancedPayments;
    }

    private HttpEntity<PickPaymentRequest> createRequestEntity(PickPaymentRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(request, headers);
    }

    private PaymentAlert extractStudentInfo(PaymentAlert payment) {
        if (payment.getNarrative() != null) {
            String[] parts = payment.getNarrative().split("\\|");
            if (parts.length >= 3) {
                String studentFullName = payment.getNr1() != null ? payment.getNr1() : parts.length > 2 ? parts[2] : "";
                String[] nameParts = studentFullName.trim().split(" ");
                if (nameParts.length > 0) {
                    payment.setStudentSurname(nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
                    payment.setStudentName(nameParts.length > 1 ? String.join(" ", Arrays.copyOfRange(nameParts, 0, nameParts.length - 1)) : nameParts[0]);
                }
                if (parts.length > 4) {
                    payment.setRegNumber(parts[4]);
                }
            }
        }
        if (payment.getRegNumber() == null) {
            payment.setRegNumber(payment.getReference());
        }
        return payment;
    }

    public boolean resetPayment(String paymentId) {
        return paymentRepository.findById(paymentId).map(payment -> {
            payment.setPicked(0);
            payment.setStatus("pending");
            paymentRepository.save(payment);
            return true;
        }).orElse(false);
    }

    public List<PaymentAlert> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    /**
     * Finds all payments in the database, resets their status to 'pending'
     * and their picked status to 0. This is a bulk operation.
     * @return true if successful, false otherwise.
     */
    @Transactional
    public boolean resetAllPayments() {
        try {
            List<PaymentAlert> allPayments = paymentRepository.findAll();
            if (allPayments.isEmpty()) {
                return true; // Nothing to reset, so the operation is successful.
            }

            for (PaymentAlert payment : allPayments) {
                payment.setPicked(0);
                payment.setStatus("pending");
            }

            paymentRepository.saveAll(allPayments); // Save all changes in one batch
            return true;
        } catch (Exception e) {
            System.err.println("Error during bulk reset of payments: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
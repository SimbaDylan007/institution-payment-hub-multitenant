package com.payments.service;

import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.time.LocalDate;
import java.time.Year;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

            List<PaymentAlert> payments = Optional.ofNullable(response.getBody())
                    .map(Arrays::asList).orElse(Collections.emptyList());
            return processAndSavePayments(payments);
        } catch (Exception e) {
            System.err.println("Error picking pending payments for " + request.getInstitutionId() + ": " + e.getMessage());
            throw new RuntimeException("Error picking pending payments", e);
        }
    }

    public List<PaymentAlert> getAllPayments(PickPaymentRequest request) {
        try {
            HttpEntity<PickPaymentRequest> entity = createRequestEntity(request);
            ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(
                    apiBaseUrl + allPaymentsPath, HttpMethod.POST, entity, PaymentAlert[].class);

            List<PaymentAlert> payments = Optional.ofNullable(response.getBody())
                    .map(Arrays::asList).orElse(Collections.emptyList());
            return processAndSavePayments(payments);
        } catch (Exception e) {
            System.err.println("Error getting all payments for " + request.getInstitutionId() + ": " + e.getMessage());
            throw new RuntimeException("Error getting all payments", e);
        }
    }

    public List<PaymentAlert> pickPaymentsForMultipleAccounts(List<String> institutionIds, String type) {
        List<PaymentAlert> allPayments = new ArrayList<>();
        for (String id : institutionIds) {
            String password = env.getProperty("zb.api.credentials." + id);
            if (password == null) {
                System.err.println("WARN: No password configured in application.properties for institution ID: " + id);
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
                // Log the specific failure but continue with other accounts
                System.err.println("Failed to fetch payments for account " + id + ". Error: " + e.getMessage());
            }
        }
        // De-duplicate the combined list before returning
        return allPayments.stream()
                .filter(p -> p.getId() != null)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(PaymentAlert::getId, p -> p, (p1, p2) -> p1),
                        map -> new ArrayList<>(map.values())
                ));
    }

    private List<PaymentAlert> processAndSavePayments(List<PaymentAlert> payments) {
        List<PaymentAlert> enhancedPayments = payments.stream()
                .map(this::processApiPayment) // Use the new, enhanced processing method
                .collect(Collectors.toList());
        return paymentRepository.saveAll(enhancedPayments);
    }

    private HttpEntity<PickPaymentRequest> createRequestEntity(PickPaymentRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(request, headers);
    }

    /**
     * Central processing hub for raw payment data from the bank API.
     * This method converts the amount from cents, determines the currency,
     * and extracts student information.
     */
    private PaymentAlert processApiPayment(PaymentAlert payment) {
        // --- THIS IS THE FIX ---
        // 1. Check if the amount is not null (it's an object now, not a primitive)
        if (payment.getAmount() != null) {
            // 2. Use BigDecimal's divide() method for precise calculation
            BigDecimal amountInDollars = payment.getAmount().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            // 3. Set the new BigDecimal value
            payment.setAmount(amountInDollars);
        }

        String source = payment.getSource();
        if (source != null && source.length() >= 3) {
            char currencyIndicator = source.charAt(source.length() - 3);
            if (currencyIndicator == '4') {
                payment.setCurrency("USD");
            } else if (currencyIndicator == '0' || currencyIndicator == '2') {
                payment.setCurrency("ZWG");
            } else {
                payment.setCurrency("UNKNOWN");
            }
        } else {
            payment.setCurrency("UNKNOWN");
        }

        if (payment.getNarrative() != null) {
            String[] parts = payment.getNarrative().split("\\|");
            Pattern pattern = Pattern.compile("P\\s?\\d+");
            Matcher matcher = pattern.matcher(payment.getNarrative());

            if (parts.length >= 3) {
                String studentFullName = payment.getNr1() != null ? payment.getNr1() : parts[2];
                String[] nameParts = studentFullName.trim().split("\\s+");
                if (nameParts.length > 0) {
                    payment.setStudentSurname(nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
                    payment.setStudentName(nameParts.length > 1 ? String.join(" ", Arrays.copyOfRange(nameParts, 0, nameParts.length - 1)) : nameParts[0]);
                }

                if (matcher.find()){
                    payment.setRegNumber(matcher.group().replaceAll("\\s", ""));
                } else if (parts.length > 4) {
                    payment.setRegNumber(parts[4].trim());
                }
            }
        }
        if (payment.getRegNumber() == null || payment.getRegNumber().isEmpty()) {
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

    @Transactional
    public boolean resetAllPayments() {
        try {
            List<PaymentAlert> allPayments = paymentRepository.findAll();
            if (allPayments.isEmpty()) {
                return true;
            }
            for (PaymentAlert payment : allPayments) {
                payment.setPicked(0);
                payment.setStatus("pending");
            }
            paymentRepository.saveAll(allPayments);
            return true;
        } catch (Exception e) {
            System.err.println("Error during bulk reset of payments: " + e.getMessage());
            return false;
        }
    }
}
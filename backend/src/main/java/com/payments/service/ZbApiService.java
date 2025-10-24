package com.payments.service;

import com.payments.config.CustomUserDetails;
import com.payments.model.Institution;
import com.payments.model.InstitutionAccount;
import com.payments.model.PaymentAlert;
import com.payments.model.PickPaymentRequest;
import com.payments.repository.InstitutionAccountRepository;
import com.payments.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
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
    private InstitutionAccountRepository institutionAccountRepository;

    @Autowired
    private Environment env;

    /**
     * Fetches payments for multiple institution accounts from the bank API,
     * enforces security rules, and associates payments with the correct institution.
     * This is the primary entry point for fetching remote payments.
     */

    @Transactional
    public List<PaymentAlert> pickPaymentsForMultipleAccounts(List<String> institutionAccountIds, String type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_SUPER_ADMIN"::equals);

        if (!isSuperAdmin) {
            List<String> allowedIds = getCurrentUserAllowedInstitutionAccountIds(authentication);
            if (!new HashSet<>(allowedIds).containsAll(institutionAccountIds)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You are not authorized to pick payments for one or more selected institutions.");
            }
        }

        List<PaymentAlert> allPayments = new ArrayList<>();
        for (String accId : institutionAccountIds) {
            String password = env.getProperty("zb.api.credentials." + accId);
            if (password == null) {
                System.err.println("WARN: No password configured for institution account ID: " + accId);
                continue;
            }
            PickPaymentRequest request = new PickPaymentRequest();
            request.setInstitutionId(accId);
            request.setPassword(password);

            try {
                String apiUrl = "all".equals(type) ? apiBaseUrl + allPaymentsPath : apiBaseUrl + pickPendingPath;
                List<PaymentAlert> rawPayments = fetchPaymentsFromApi(request, apiUrl);
                allPayments.addAll(this.processAndSavePayments(rawPayments, accId));
            } catch (Exception e) {
                System.err.println("Failed to fetch payments for account " + accId + ". Error: " + e.getMessage());
            }
        }

        return allPayments.stream()
                .filter(p -> p.getId() != null)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(PaymentAlert::getId, p -> p, (p1, p2) -> p1),
                        map -> new ArrayList<>(map.values())
                ));
    }

    /**
     * Fetches payments from the local database based on the current user's role and institution.
     */
    @Transactional(readOnly = true)
    public List<PaymentAlert> getPaymentsByStatus(String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(ga -> ga.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            return paymentRepository.findByStatus(status);
        } else {
            Institution userInstitution = getInstitutionForUser(authentication);
            if (userInstitution == null) {
                return Collections.emptyList();
            }
            return paymentRepository.findByStatusAndInstitution(status, userInstitution);
        }
    }

    /**
     * Executes the REST call to the bank API.
     */
    private List<PaymentAlert> fetchPaymentsFromApi(PickPaymentRequest request, String url) {
        HttpEntity<PickPaymentRequest> entity = createRequestEntity(request);
        ResponseEntity<PaymentAlert[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, PaymentAlert[].class);
        return Optional.ofNullable(response.getBody())
                .map(Arrays::asList)
                .orElse(Collections.emptyList());
    }

    /**
     * Processes a list of raw payments, links them to an institution, and saves them.
     */
    private List<PaymentAlert> processAndSavePayments(List<PaymentAlert> payments, String institutionAccountId) {
        if (payments.isEmpty()) {
            return Collections.emptyList();
        }

        InstitutionAccount account = institutionAccountRepository.findByInstitutionId(institutionAccountId)
                .orElseThrow(() -> new IllegalStateException("Configuration error: No InstitutionAccount found for ID: " + institutionAccountId));

        Institution institution = account.getInstitution();
        if (institution == null) {
            throw new IllegalStateException("Configuration error: InstitutionAccount " + institutionAccountId + " is not linked to a parent Institution.");
        }

        List<PaymentAlert> enhancedPayments = payments.stream()
                .map(payment -> {
                    PaymentAlert processedPayment = processApiPayment(payment);
                    processedPayment.setInstitution(institution);
                    return processedPayment;
                })
                .collect(Collectors.toList());

        return paymentRepository.saveAll(enhancedPayments);
    }

    private HttpEntity<PickPaymentRequest> createRequestEntity(PickPaymentRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(request, headers);
    }

    private PaymentAlert processApiPayment(PaymentAlert payment) {
        if (payment.getAmount() != null) {
            BigDecimal amountInDollars = payment.getAmount().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            payment.setAmount(amountInDollars);
        }

        String source = payment.getSource();
        if (source != null && source.length() >= 3) {
            char currencyIndicator = source.charAt(source.length() - 3);
            payment.setCurrency(currencyIndicator == '4' ? "USD" : "ZWG");
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
        // Future Enhancement: Add a security check to ensure user can access this payment before resetting.
        return paymentRepository.findById(paymentId).map(payment -> {
            payment.setPicked(0);
            payment.setStatus("pending");
            paymentRepository.save(payment);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean resetAllPayments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(ga -> ga.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isSuperAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only a Super Admin can reset all payments.");
        }

        try {
            paymentRepository.deleteAllInBatch();
            return true;
        } catch (Exception e) {
            System.err.println("Error during bulk reset of payments: " + e.getMessage());
            return false;
        }
    }


    private List<String> getCurrentUserAllowedInstitutionAccountIds(Authentication authentication) {
        Institution institution = getInstitutionForUser(authentication);

        if (institution == null) {
            throw new IllegalStateException("Authenticated user '" + authentication.getName() + "' is not associated with any institution.");
        }

        List<InstitutionAccount> accounts = institution.getInstitutionAccounts();
        if (accounts == null || accounts.isEmpty()) {
            System.err.println("WARN: Institution '" + institution.getName() + "' has no institution bank accounts configured.");
            return Collections.emptyList();
        }

        return accounts.stream()
                .map(InstitutionAccount::getInstitutionId)
                .collect(Collectors.toList());
    }

    private Institution getInstitutionForUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getInstitution();
        } else {
            System.err.println("ERROR: Security Principal is not an instance of CustomUserDetails. Could not retrieve institution. Principal type: " + principal.getClass().getName());
            return null;
        }
    }
}
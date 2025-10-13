package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.Optional;

@Service
public class StudentRegistrationService {

    @Value("${zb.api.base-url}")
    private String apiBaseUrl;

    @Value("${zb.api.student-details}")
    private String saveStudentDetailsPath;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private StudentRegistrationRepository studentRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    public StudentRegistration saveStudentRegistration(StudentRegistrationRequest request) {
        try {
            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build request entity
            HttpEntity<StudentRegistrationRequest> entity = new HttpEntity<>(request, headers);

            // Make the API call
            ResponseEntity<StudentRegistration> response = restTemplate.exchange(
                    apiBaseUrl + saveStudentDetailsPath,
                    HttpMethod.POST,
                    entity,
                    StudentRegistration.class
            );

            // Save response data to DB
            StudentRegistration saved = studentRegistrationRepository.save(response.getBody());

            return saved;

        } catch (HttpClientErrorException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            throw new RuntimeException("API Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            System.err.println("Error saving student registration: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error saving student registration", e);
        }
    }

    public List<StudentRegistration> getAllStudentRegistrations() {
        return studentRegistrationRepository.findAll();
    }

    public List<StudentRegistration> getStudentRegistrationsByBillerId(String billerId) {
        return studentRegistrationRepository.findByIdBillerId(billerId);
    }

    public Optional<StudentRegistration> getStudentRegistration(String billerId, String customerAccount) {

        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null) {
            return Optional.empty();
        }

        StudentRegistrationId id = new StudentRegistrationId(billerId, customerAccount, institution);
        return studentRegistrationRepository.findById(id);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }

}

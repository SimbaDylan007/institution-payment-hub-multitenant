
package com.payments.controller;

import com.payments.model.ErrorDetails;
import com.payments.model.StudentRegistration;
import com.payments.model.StudentRegistrationRequest;
import com.payments.service.StudentRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/billpay")
@CrossOrigin
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN','SUPER_ADMIN')")
public class StudentController {

    @Autowired
    private StudentRegistrationService studentRegistrationService;
    
    @PostMapping("/student-details")
    public ResponseEntity<Object> createOrUpdateStudentRegistration(@RequestBody StudentRegistrationRequest request) {
        try {
            if (request.getBillerId() == null || request.getCustomerAccount() == null) {
                return ResponseEntity
                    .badRequest()
                    .body(new ErrorDetails("Invalid input data: billerId and customerAccount are required", null, null));
            }
            
            StudentRegistration savedRegistration = studentRegistrationService.saveStudentRegistration(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRegistration);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorDetails("Failed to save student registration: " + e.getMessage(), null, null));
        }
    }
    
    @GetMapping("/student-details")
    public ResponseEntity<List<StudentRegistration>> getAllStudentRegistrations() {
        return ResponseEntity.ok(studentRegistrationService.getAllStudentRegistrations());
    }
    
    @GetMapping("/student-details/{billerId}")
    public ResponseEntity<List<StudentRegistration>> getStudentRegistrationsByBillerId(
            @PathVariable String billerId) {
        return ResponseEntity.ok(studentRegistrationService.getStudentRegistrationsByBillerId(billerId));
    }
    
    @GetMapping("/student-details/{billerId}/{customerAccount}")
    public ResponseEntity<Object> getStudentRegistration(
            @PathVariable String billerId,
            @PathVariable String customerAccount) {
        return studentRegistrationService.getStudentRegistration(billerId, customerAccount)
            .map(registration -> ResponseEntity.ok().body((Object) registration))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorDetails("Student registration not found", null, null)));
    }
}

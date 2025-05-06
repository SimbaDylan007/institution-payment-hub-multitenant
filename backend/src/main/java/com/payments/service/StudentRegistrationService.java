
package com.payments.service;

import com.payments.model.StudentRegistration;
import com.payments.model.StudentRegistrationId;
import com.payments.model.StudentRegistrationRequest;
import com.payments.repository.StudentRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentRegistrationService {

    @Autowired
    private StudentRegistrationRepository studentRegistrationRepository;
    
    public StudentRegistration saveStudentRegistration(StudentRegistrationRequest request) {
        StudentRegistration studentRegistration = StudentRegistration.fromRequest(request);
        return studentRegistrationRepository.save(studentRegistration);
    }
    
    public List<StudentRegistration> getAllStudentRegistrations() {
        return studentRegistrationRepository.findAll();
    }
    
    public List<StudentRegistration> getStudentRegistrationsByBillerId(String billerId) {
        return studentRegistrationRepository.findByIdBillerId(billerId);
    }
    
    public Optional<StudentRegistration> getStudentRegistration(String billerId, String customerAccount) {
        StudentRegistrationId id = new StudentRegistrationId(billerId, customerAccount);
        return studentRegistrationRepository.findById(id);
    }
}


package com.payments.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_registrations")
public class StudentRegistration {
    
    @EmbeddedId
    private StudentRegistrationId id;
    
    private String customerAccountDetails1;
    private String customerAccountDetails2;
    private String customerName;
    
    public static StudentRegistration fromRequest(StudentRegistrationRequest request) {
        StudentRegistrationId id = new StudentRegistrationId(
                request.getBillerId(),
                request.getCustomerAccount()
        );
        
        return new StudentRegistration(
                id,
                request.getCustomerAccountDetails1(),
                request.getCustomerAccountDetails2(),
                request.getCustomerName()
        );
    }
}

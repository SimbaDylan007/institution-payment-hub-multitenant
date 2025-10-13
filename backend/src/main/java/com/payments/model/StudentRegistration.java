package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "student_registrations")
public class StudentRegistration {

    @EmbeddedId
    private StudentRegistrationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Institution institution;

    private String customerName;
    private String customerAccountDetails1;
    private String customerAccountDetails2;

    public StudentRegistration() {
    }

    // Getters and Setters
    public StudentRegistrationId getId() { return id; }
    public void setId(StudentRegistrationId id) { this.id = id; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerAccountDetails1() { return customerAccountDetails1; }
    public void setCustomerAccountDetails1(String customerAccountDetails1) { this.customerAccountDetails1 = customerAccountDetails1; }
    public String getCustomerAccountDetails2() { return customerAccountDetails2; }
    public void setCustomerAccountDetails2(String customerAccountDetails2) { this.customerAccountDetails2 = customerAccountDetails2; }
}
package com.payments.model;

import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

// We have removed all Lombok annotations (@Data, @NoArgsConstructor, @AllArgsConstructor)
// and provided explicit constructors and methods to ensure the code always compiles correctly.
@Entity
@Table(name = "student_registrations")
public class StudentRegistration {

    @EmbeddedId
    private StudentRegistrationId id;

    private String customerName;
    private String customerAccountDetails1;
    private String customerAccountDetails2;

    /**
     * A public no-argument constructor is a requirement for JPA entities.
     */
    public StudentRegistration() {
    }

    /**
     * This is the specific constructor that other parts of your application code require.
     * It allows for creating a fully initialized object.
     */
    public StudentRegistration(StudentRegistrationId id, String customerName, String customerAccountDetails1, String customerAccountDetails2) {
        this.id = id;
        this.customerName = customerName;
        this.customerAccountDetails1 = customerAccountDetails1;
        this.customerAccountDetails2 = customerAccountDetails2;
    }

    // --- Public Getters and Setters ---
    // These are required for Spring/JPA and the rest of your application to access the object's fields.

    public StudentRegistrationId getId() {
        return id;
    }

    public void setId(StudentRegistrationId id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAccountDetails1() {
        return customerAccountDetails1;
    }

    public void setCustomerAccountDetails1(String customerAccountDetails1) {
        this.customerAccountDetails1 = customerAccountDetails1;
    }

    public String getCustomerAccountDetails2() {
        return customerAccountDetails2;
    }

    public void setCustomerAccountDetails2(String customerAccountDetails2) {
        this.customerAccountDetails2 = customerAccountDetails2;
    }
}
package com.payments.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentRegistrationId implements Serializable {

    private String billerId;
    private String customerAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;

    // Default constructor required by JPA
    public StudentRegistrationId() {
    }

    // --- ADD THIS CONSTRUCTOR ---
    // This constructor is needed by your service layer.
    public StudentRegistrationId(String billerId, String customerAccount, Institution institution) {
        this.billerId = billerId;
        this.customerAccount = customerAccount;
        this.institution = institution;
    }

    // Getters, Setters, hashCode, and equals
    public String getBillerId() { return billerId; }
    public void setBillerId(String billerId) { this.billerId = billerId; }
    public String getCustomerAccount() { return customerAccount; }
    public void setCustomerAccount(String customerAccount) { this.customerAccount = customerAccount; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudentRegistrationId that = (StudentRegistrationId) o;
        return Objects.equals(billerId, that.billerId) &&
                Objects.equals(customerAccount, that.customerAccount) &&
                Objects.equals(institution, that.institution);
    }

    @Override
    public int hashCode() {
        return Objects.hash(billerId, customerAccount, institution);
    }
}
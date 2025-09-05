package com.payments.model;

import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Represents the composite primary key for the StudentRegistration entity.
 * A composite key class must be public, have a no-arg constructor,
 * and implement Serializable, hashCode(), and equals().
 */
@Embeddable
public class StudentRegistrationId implements Serializable {

    private String billerId;
    private String customerAccount;

    /**
     * Default constructor required by JPA.
     */
    public StudentRegistrationId() {
    }

    /**
     * Constructor to create a new instance with all key fields.
     *
     * @param billerId        The ID of the biller.
     * @param customerAccount The customer's account number or ID.
     */
    public StudentRegistrationId(String billerId, String customerAccount) {
        this.billerId = billerId;
        this.customerAccount = customerAccount;
    }

    // --- Getters and Setters ---

    public String getBillerId() {
        return billerId;
    }

    public void setBillerId(String billerId) {
        this.billerId = billerId;
    }

    public String getCustomerAccount() {
        return customerAccount;
    }

    public void setCustomerAccount(String customerAccount) {
        this.customerAccount = customerAccount;
    }

    // --- hashCode and equals ---

    /**
     * The equals method is crucial for composite keys. It allows JPA to determine
     * if two entities with the same ID are the same.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudentRegistrationId that = (StudentRegistrationId) o;
        return Objects.equals(billerId, that.billerId) &&
                Objects.equals(customerAccount, that.customerAccount);
    }

    /**
     * The hashCode method must be consistent with the equals method.
     * If two objects are equal, they must have the same hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(billerId, customerAccount);
    }
}
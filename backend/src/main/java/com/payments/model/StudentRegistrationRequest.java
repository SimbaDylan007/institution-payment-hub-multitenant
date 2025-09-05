
package com.payments.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {
    private String billerId;
    private String customerAccount;
    private String customerAccountDetails1;
    private String customerAccountDetails2;
    private String customerName;

    // --- Getters and Setters ---
    public String getBillerId() { return billerId; }
    public void setBillerId(String billerId) { this.billerId = billerId; }
    public String getCustomerAccount() { return customerAccount; }
    public void setCustomerAccount(String customerAccount) { this.customerAccount = customerAccount; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerAccountDetails1() { return customerAccountDetails1; }
    public void setCustomerAccountDetails1(String customerAccountDetails1) { this.customerAccountDetails1 = customerAccountDetails1; }
    public String getCustomerAccountDetails2() { return customerAccountDetails2; }
    public void setCustomerAccountDetails2(String customerAccountDetails2) { this.customerAccountDetails2 = customerAccountDetails2; }
}

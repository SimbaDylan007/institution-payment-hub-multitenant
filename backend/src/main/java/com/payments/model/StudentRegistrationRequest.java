
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
}

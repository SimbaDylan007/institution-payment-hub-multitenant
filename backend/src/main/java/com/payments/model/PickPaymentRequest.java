
package com.payments.model;

import lombok.Data;

@Data
public class PickPaymentRequest {
    private String institutionId;
    private String password;
}

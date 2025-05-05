
package com.payments.model;

import lombok.Data;

@Data
public class ErrorDetails {
    private String details;
    private String message;
    private String timestamp;
}

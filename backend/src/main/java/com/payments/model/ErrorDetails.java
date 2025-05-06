//
//package com.payments.model;
//
//import lombok.Data;
//
//@Data
//public class ErrorDetails {
//    private String details;
//    private String message;
//    private String timestamp;
//}

package com.payments.model;

import lombok.Data;

@Data
public class ErrorDetails {
    private String details;
    private String message;
    private String timestamp;

    // No-arg constructor
    public ErrorDetails() {
    }

    // All-args constructor
    public ErrorDetails(String message, String timestamp, String details) {
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }
}

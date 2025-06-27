package com.payments.model;

import lombok.Data;

@Data // This generates getters and setters
public class ErrorDetails {
    private String details;
    private String message;
    private String timestamp;

    // No-arg constructor (provided by Lombok's @NoArgsConstructor if used, but explicit is fine)
    public ErrorDetails() {
    }

    // All-args constructor (provided by Lombok's @AllArgsConstructor if used, but explicit is fine)
    public ErrorDetails(String message, String timestamp, String details) {
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }

}
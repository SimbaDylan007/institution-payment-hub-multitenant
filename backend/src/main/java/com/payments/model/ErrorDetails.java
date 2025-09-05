package com.payments.model;

public class ErrorDetails {
    private String message;
    private String details;
    private String timestamp;

    public ErrorDetails() {}

    public ErrorDetails(String message, String details, String timestamp) {
        this.message = message;
        this.details = details;
        this.timestamp = timestamp;
    }

    // --- Getters and Setters ---
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
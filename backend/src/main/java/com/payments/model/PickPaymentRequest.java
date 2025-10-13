package com.payments.model;

// It's fine to keep @Data for convenience (e.g., for toString(), equals(), hashCode()),
// but we will add the explicit getters and setters for maximum compatibility.
import lombok.Data;

@Data
public class PickPaymentRequest {
    private String institutionId;
    private String password;

    // --- ADD THESE PUBLIC GETTERS AND SETTERS ---

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
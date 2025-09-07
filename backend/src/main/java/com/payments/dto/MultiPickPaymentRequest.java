package com.payments.dto;

import java.util.List;

public class MultiPickPaymentRequest {
    private List<String> institutionIds;

    // Getters and Setters
    public List<String> getInstitutionIds() {
        return institutionIds;
    }

    public void setInstitutionIds(List<String> institutionIds) {
        this.institutionIds = institutionIds;
    }
}
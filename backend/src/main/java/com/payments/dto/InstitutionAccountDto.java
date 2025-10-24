package com.payments.dto;

public class InstitutionAccountDto {

    private Long id;
    private String institutionId;
    private String accountName;
    private InstitutionDto institution;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public InstitutionDto getInstitution() { return institution; }
    public void setInstitution(InstitutionDto institution) { this.institution = institution; }
}
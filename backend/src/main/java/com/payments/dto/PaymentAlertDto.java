package com.payments.dto;

import java.math.BigDecimal;

public class PaymentAlertDto {

    private String id;
    private BigDecimal amount;
    private String currency;
    private String narrative;
    private int picked;
    private String reference;
    private String status;
    private String transactionDate;
    private String studentName;
    private String studentSurname;
    private String regNumber;
    private InstitutionDto institution;

    // --- Getters and Setters for all fields ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getNarrative() { return narrative; }
    public void setNarrative(String narrative) { this.narrative = narrative; }
    public int getPicked() { return picked; }
    public void setPicked(int picked) { this.picked = picked; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentSurname() { return studentSurname; }
    public void setStudentSurname(String studentSurname) { this.studentSurname = studentSurname; }
    public String getRegNumber() { return regNumber; }
    public void setRegNumber(String regNumber) { this.regNumber = regNumber; }
    public InstitutionDto getInstitution() { return institution; }
    public void setInstitution(InstitutionDto institution) { this.institution = institution; }
}
package com.payments.model;


import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class InstitutionAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Use Long for primary key, auto-incremented
    private String institutionId; // This was 'id' in your frontend, but is a string identifier
    private String accountName;

    // Constructors
    public InstitutionAccount() {
    }

    public InstitutionAccount(String institutionId, String accountName) {
        this.institutionId = institutionId;
        this.accountName = accountName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    @Override
    public String toString() {
        return "InstitutionAccount{" +
                "id=" + id +
                ", institutionId='" + institutionId + '\'' +
                ", accountName='" + accountName + '\'' +
                '}';
    }
}
package com.payments.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Entity
@Table(name = "institution_account")
public class InstitutionAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "institution_id") // Maps to your 'institution_id' column (e.g., "METHODIST-ZWG")
    private String institutionId;

    @Column(name = "account_name") // Maps to your 'account_name' column
    private String accountName;


    @ManyToOne(fetch = FetchType.LAZY)

    @JoinColumn(name = "institution_fk", nullable = false)
    @JsonIgnore
    private Institution institution;

    // Constructors
    public InstitutionAccount() {
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

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }
}
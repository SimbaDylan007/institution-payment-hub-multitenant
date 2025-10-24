package com.payments.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer"})
@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String address;

    @Column(name = "school_email")
    private String schoolEmail;


    @OneToMany(
            mappedBy = "institution",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private List<InstitutionAccount> institutionAccounts = new ArrayList<>();


    public Institution() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getSchoolEmail() { return schoolEmail; }
    public void setSchoolEmail(String schoolEmail) { this.schoolEmail = schoolEmail; }

    // --- GETTER AND SETTER FOR THE NEW LIST ---
    public List<InstitutionAccount> getInstitutionAccounts() {
        return institutionAccounts;
    }

    public void setInstitutionAccounts(List<InstitutionAccount> institutionAccounts) {
        this.institutionAccounts = institutionAccounts;
    }
}
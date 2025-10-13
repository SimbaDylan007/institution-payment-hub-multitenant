package com.payments.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;

@JsonIgnoreProperties({"hibernateLazyInitializer"})
@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Pachedu Junior Academy", "Sunnyside Primary"

    // Add other details about the school if you want, e.g., address, contact email
    private String address;
    private String schoolEmail;

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
}
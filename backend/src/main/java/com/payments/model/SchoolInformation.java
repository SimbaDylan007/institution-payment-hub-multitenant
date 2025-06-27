package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "school_information")
public class SchoolInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Or a fixed ID if you prefer
    private Long id;

    private String schoolName;
    private String schoolAddress;
    private String schoolPhone;

    // Constructors
    public SchoolInformation() {}

    public SchoolInformation(String schoolName, String schoolAddress, String schoolPhone) {
        this.schoolName = schoolName;
        this.schoolAddress = schoolAddress;
        this.schoolPhone = schoolPhone;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getSchoolAddress() { return schoolAddress; }
    public void setSchoolAddress(String schoolAddress) { this.schoolAddress = schoolAddress; }
    public String getSchoolPhone() { return schoolPhone; }
    public void setSchoolPhone(String schoolPhone) { this.schoolPhone = schoolPhone; }
}
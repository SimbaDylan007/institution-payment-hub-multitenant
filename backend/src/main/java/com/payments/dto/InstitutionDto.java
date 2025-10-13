package com.payments.dto;

public class InstitutionDto {
    private String name;
    private String address;
    private String schoolEmail;

    // --- Getters and Setters ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getSchoolEmail() { return schoolEmail; }
    public void setSchoolEmail(String schoolEmail) { this.schoolEmail = schoolEmail; }
}
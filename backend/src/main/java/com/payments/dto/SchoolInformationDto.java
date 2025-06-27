package com.payments.dto;

// Add validation if needed (e.g., javax.validation.constraints.NotBlank)
public class SchoolInformationDto {
    private String schoolName ="";
    private String schoolAddress="";
    private String schoolPhone="";

    // Getters and Setters
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getSchoolAddress() { return schoolAddress; }
    public void setSchoolAddress(String schoolAddress) { this.schoolAddress = schoolAddress; }
    public String getSchoolPhone() { return schoolPhone; }
    public void setSchoolPhone(String schoolPhone) { this.schoolPhone = schoolPhone; }
}
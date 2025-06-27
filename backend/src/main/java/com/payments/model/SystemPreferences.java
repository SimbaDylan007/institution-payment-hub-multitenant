package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "system_preferences")
public class SystemPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Or a fixed ID
    private Long id;

    private String academicYear;
    private String timeZone;
    private String language;

    // Constructors
    public SystemPreferences() {}

    public SystemPreferences(String academicYear, String timeZone, String language) {
        this.academicYear = academicYear;
        this.timeZone = timeZone;
        this.language = language;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
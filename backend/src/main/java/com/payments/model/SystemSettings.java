package com.payments.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    // We will only ever have one row in this table, so we use a fixed ID.
    @Id
    private Long id;

    @Column(nullable = false)
    private String currentAcademicYear;

    @Column(nullable = false)
    private String currentSemester;

    // You can add more settings here in the future, e.g., school name, address, etc.

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCurrentAcademicYear() { return currentAcademicYear; }
    public void setCurrentAcademicYear(String currentAcademicYear) { this.currentAcademicYear = currentAcademicYear; }
    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }
}
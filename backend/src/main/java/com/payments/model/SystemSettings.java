package com.payments.model;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false, unique = true)
    @JsonIgnore
    private Institution institution;

    @Column(nullable = false)
    private String currentAcademicYear;

    @Column(nullable = false)
    private String currentSemester;

    // You can add more settings here in the future, e.g., school name, address, etc.

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
    public String getCurrentAcademicYear() { return currentAcademicYear; }
    public void setCurrentAcademicYear(String currentAcademicYear) { this.currentAcademicYear = currentAcademicYear; }
    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }
}
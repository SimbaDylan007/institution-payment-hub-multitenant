
package com.payments.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String code;
    
    private String description;
    
    @Column(nullable = false)
    private String grade;
    
    private Integer credits;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;
    
    // Constructors
    public Subject() {}
    
    public Subject(String name, String code, String grade) {
        this.name = name;
        this.code = code;
        this.grade = grade;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // --- ADD GETTER AND SETTER FOR INSTITUTION ---
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}

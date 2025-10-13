package com.payments.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_usage_logs")
public class ResourceUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String resourceName; // e.g., "Library", "Computer Lab 1", "Chemistry Lab"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id") // Optional, but good for tracking who used it
    private Student student;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;

    @Column(nullable = false)
    private LocalDateTime usageTimestamp;

    // Constructors
    public ResourceUsageLog() {
        this.usageTimestamp = LocalDateTime.now();
    }

    public ResourceUsageLog(String resourceName, Student student) {
        this.resourceName = resourceName;
        this.student = student;
        this.usageTimestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public LocalDateTime getUsageTimestamp() { return usageTimestamp; }
    public void setUsageTimestamp(LocalDateTime usageTimestamp) { this.usageTimestamp = usageTimestamp; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}
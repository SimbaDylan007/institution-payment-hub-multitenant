package com.payments.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = true)
    private Institution institution;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String action; // e.g., "com.payments.service.UserService.createUser"

    @Lob // Large Object, for storing potentially long details
    @Column(columnDefinition = "TEXT")
    private String details; // e.g., JSON of the request parameters

    @Column(nullable = false)
    private String status; // e.g., "SUCCESS", "FAILURE"

    private String ipAddress;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}
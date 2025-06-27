package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "security_features")
public class SecurityFeatures {
    @Id
    private Long id; // Use a fixed ID, e.g., 1L

    private boolean enableTwoFactorAuth = false; // Default off
    private boolean enableSessionTimeout = true; // Default on
    // private int sessionTimeoutMinutes = 30; // Could be a separate field
    private boolean logSecurityEvents = true; // Default on

    public SecurityFeatures() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public boolean isEnableTwoFactorAuth() { return enableTwoFactorAuth; }
    public void setEnableTwoFactorAuth(boolean enableTwoFactorAuth) { this.enableTwoFactorAuth = enableTwoFactorAuth; }
    public boolean isEnableSessionTimeout() { return enableSessionTimeout; }
    public void setEnableSessionTimeout(boolean enableSessionTimeout) { this.enableSessionTimeout = enableSessionTimeout; }
    public boolean isLogSecurityEvents() { return logSecurityEvents; }
    public void setLogSecurityEvents(boolean logSecurityEvents) { this.logSecurityEvents = logSecurityEvents; }
}
package com.payments.dto;

public class SecurityFeaturesDto {
    private boolean enableTwoFactorAuth;
    private boolean enableSessionTimeout;
    private boolean logSecurityEvents;

    // Getters and Setters
    public boolean isEnableTwoFactorAuth() { return enableTwoFactorAuth; }
    public void setEnableTwoFactorAuth(boolean enableTwoFactorAuth) { this.enableTwoFactorAuth = enableTwoFactorAuth; }
    public boolean isEnableSessionTimeout() { return enableSessionTimeout; }
    public void setEnableSessionTimeout(boolean enableSessionTimeout) { this.enableSessionTimeout = enableSessionTimeout; }
    public boolean isLogSecurityEvents() { return logSecurityEvents; }
    public void setLogSecurityEvents(boolean logSecurityEvents) { this.logSecurityEvents = logSecurityEvents; }
}
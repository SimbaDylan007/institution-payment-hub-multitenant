package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "password_policy")
public class PasswordPolicy {
    @Id
    private Long id; // Use a fixed ID, e.g., 1L, as there's usually one global policy

    private int minLength = 8; // Default value
    private boolean requireSpecialChars = true;
    private boolean requireNumbers = true;
    private boolean requireUppercase = true;
    private boolean requireLowercase = true;

    public PasswordPolicy() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getMinLength() { return minLength; }
    public void setMinLength(int minLength) { this.minLength = minLength; }
    public boolean isRequireSpecialChars() { return requireSpecialChars; }
    public void setRequireSpecialChars(boolean requireSpecialChars) { this.requireSpecialChars = requireSpecialChars; }
    public boolean isRequireNumbers() { return requireNumbers; }
    public void setRequireNumbers(boolean requireNumbers) { this.requireNumbers = requireNumbers; }
    public boolean isRequireUppercase() { return requireUppercase; }
    public void setRequireUppercase(boolean requireUppercase) { this.requireUppercase = requireUppercase; }
    public boolean isRequireLowercase() { return requireLowercase; }
    public void setRequireLowercase(boolean requireLowercase) { this.requireLowercase = requireLowercase; }
}
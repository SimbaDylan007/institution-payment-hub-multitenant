package com.payments.dto;

public class PasswordPolicyDto {
    private int minLength;
    private boolean requireSpecialChars;
    private boolean requireNumbers;
    private boolean requireUppercase;
    private boolean requireLowercase;

    // Getters and Setters
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
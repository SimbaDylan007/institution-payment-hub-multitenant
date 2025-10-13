
package com.payments.dto;

import java.util.List;

public class UserCreationDto {
    private String username;
    private String password;
    private String email;
    private Boolean enabled;
    private List<String> roleNames;
    private Long institutionId;

    // Constructors
    public UserCreationDto() {}

    public UserCreationDto(String username, String password, String email, Boolean enabled, List<String> roleNames, Long institutionId) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.enabled = enabled;
        this.roleNames = roleNames;
        this.institutionId = institutionId;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Boolean isEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public List<String> getRoleNames() { return roleNames; }
    public void setRoleNames(List<String> roleNames) { this.roleNames = roleNames; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
}

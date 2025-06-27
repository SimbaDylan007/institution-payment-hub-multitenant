
package com.payments.dto;

import java.util.List;

public class UserCreationDto {
    private String username;
    private String password;
    private String email;
    private boolean enabled;
    private List<String> roleNames;

    // Constructors
    public UserCreationDto() {}

    public UserCreationDto(String username, String password, String email, boolean enabled, List<String> roleNames) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.enabled = enabled;
        this.roleNames = roleNames;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public List<String> getRoleNames() { return roleNames; }
    public void setRoleNames(List<String> roleNames) { this.roleNames = roleNames; }
}

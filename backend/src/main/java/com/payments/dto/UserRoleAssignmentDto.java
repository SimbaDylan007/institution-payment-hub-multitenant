
package com.payments.dto;

import java.util.List;

public class UserRoleAssignmentDto {
    private Long userId;
    private List<String> roleNames;

    // Constructors
    public UserRoleAssignmentDto() {}

    public UserRoleAssignmentDto(Long userId, List<String> roleNames) {
        this.userId = userId;
        this.roleNames = roleNames;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<String> getRoleNames() { return roleNames; }
    public void setRoleNames(List<String> roleNames) { this.roleNames = roleNames; }
}

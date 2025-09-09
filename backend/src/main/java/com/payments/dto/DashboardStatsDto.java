package com.payments.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

// This will be our main response object
@JsonInclude(JsonInclude.Include.NON_NULL) // Hides fields that are null (e.g., admin stats for a teacher)
public class DashboardStatsDto {

    private String userRole;
    private List<StatCardDto> stats;

    // Getters and Setters
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public List<StatCardDto> getStats() { return stats; }
    public void setStats(List<StatCardDto> stats) { this.stats = stats; }
}
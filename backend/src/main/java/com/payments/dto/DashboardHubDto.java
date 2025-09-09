package com.payments.dto;

import java.util.List;

public class DashboardHubDto {
    private String greeting;
    private List<HubAlertDto> alerts;
    private List<QuickActionDto> quickActions;

    // Getters and Setters
    public String getGreeting() { return greeting; }
    public void setGreeting(String greeting) { this.greeting = greeting; }
    public List<HubAlertDto> getAlerts() { return alerts; }
    public void setAlerts(List<HubAlertDto> alerts) { this.alerts = alerts; }
    public List<QuickActionDto> getQuickActions() { return quickActions; }
    public void setQuickActions(List<QuickActionDto> quickActions) { this.quickActions = quickActions; }
}
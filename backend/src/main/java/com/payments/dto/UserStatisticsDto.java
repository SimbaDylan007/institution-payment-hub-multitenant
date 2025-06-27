package com.payments.dto;

public class UserStatisticsDto {
    private long totalUsers;
    private long activeUsers;
    private long administrators;
    private long teachers;

    public UserStatisticsDto() {}

    public UserStatisticsDto(long totalUsers, long activeUsers, long administrators, long teachers) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.administrators = administrators;
        this.teachers = teachers;
    }

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    public long getAdministrators() { return administrators; }
    public void setAdministrators(long administrators) { this.administrators = administrators; }
    public long getTeachers() { return teachers; }
    public void setTeachers(long teachers) { this.teachers = teachers; }
}
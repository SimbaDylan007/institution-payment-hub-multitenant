package com.payments.dto;

public class AttendanceAnalyticsDto {
    private double overallAttendancePercentage;
    private String classWithHighestAttendance;
    private String classWithLowestAttendance;

    // Getters and Setters
    public double getOverallAttendancePercentage() { return overallAttendancePercentage; }
    public void setOverallAttendancePercentage(double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; }
    public String getClassWithHighestAttendance() { return classWithHighestAttendance; }
    public void setClassWithHighestAttendance(String classWithHighestAttendance) { this.classWithHighestAttendance = classWithHighestAttendance; }
    public String getClassWithLowestAttendance() { return classWithLowestAttendance; }
    public void setClassWithLowestAttendance(String classWithLowestAttendance) { this.classWithLowestAttendance = classWithLowestAttendance; }
}
package com.payments.dto;

public class ClassPerformanceDto {
    private String topPerformingClass;
    private double topClassAverageGrade;
    private int totalClasses;

    // Getters and Setters
    public String getTopPerformingClass() { return topPerformingClass; }
    public void setTopPerformingClass(String topPerformingClass) { this.topPerformingClass = topPerformingClass; }
    public double getTopClassAverageGrade() { return topClassAverageGrade; }
    public void setTopClassAverageGrade(double topClassAverageGrade) { this.topClassAverageGrade = topClassAverageGrade; }
    public int getTotalClasses() { return totalClasses; }
    public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }
}
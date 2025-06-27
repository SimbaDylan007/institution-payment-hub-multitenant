package com.payments.dto;

public class SubjectAnalyticsDto {
    private String highestAverageSubject;
    private String lowestAverageSubject;
    private int totalSubjects;

    // Getters and Setters
    public String getHighestAverageSubject() { return highestAverageSubject; }
    public void setHighestAverageSubject(String highestAverageSubject) { this.highestAverageSubject = highestAverageSubject; }
    public String getLowestAverageSubject() { return lowestAverageSubject; }
    public void setLowestAverageSubject(String lowestAverageSubject) { this.lowestAverageSubject = lowestAverageSubject; }
    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }
}
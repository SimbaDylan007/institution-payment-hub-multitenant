package com.payments.dto;

public class StudentPerformanceDto {
    private double averageGrade;
    private String topPerformingStudent;
    private String lowestPerformingStudent;
    private int studentsAboveAverage;

    // Constructors
    public StudentPerformanceDto() {}

    // Getters and Setters
    public double getAverageGrade() { return averageGrade; }
    public void setAverageGrade(double averageGrade) { this.averageGrade = averageGrade; }
    public String getTopPerformingStudent() { return topPerformingStudent; }
    public void setTopPerformingStudent(String topPerformingStudent) { this.topPerformingStudent = topPerformingStudent; }
    public String getLowestPerformingStudent() { return lowestPerformingStudent; }
    public void setLowestPerformingStudent(String lowestPerformingStudent) { this.lowestPerformingStudent = lowestPerformingStudent; }
    public int getStudentsAboveAverage() { return studentsAboveAverage; }
    public void setStudentsAboveAverage(int studentsAboveAverage) { this.studentsAboveAverage = studentsAboveAverage; }
}
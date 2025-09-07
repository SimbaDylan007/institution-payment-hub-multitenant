package com.payments.dto;

import java.math.BigDecimal;

public class StudentFinancialSummaryDto {

    private String studentName;
    private String studentId;
    private String gradeLevel;
    private BigDecimal totalCharges;
    private BigDecimal totalPayments;
    private BigDecimal periodBalance; // Charges - Payments for the period
    private BigDecimal outstandingBalance; // Overall total balance

    // Getters and Setters for all fields
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }
    public BigDecimal getTotalCharges() { return totalCharges; }
    public void setTotalCharges(BigDecimal totalCharges) { this.totalCharges = totalCharges; }
    public BigDecimal getTotalPayments() { return totalPayments; }
    public void setTotalPayments(BigDecimal totalPayments) { this.totalPayments = totalPayments; }
    public BigDecimal getPeriodBalance() { return periodBalance; }
    public void setPeriodBalance(BigDecimal periodBalance) { this.periodBalance = periodBalance; }
    public BigDecimal getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(BigDecimal outstandingBalance) { this.outstandingBalance = outstandingBalance; }
}
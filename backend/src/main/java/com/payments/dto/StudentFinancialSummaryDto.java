package com.payments.dto;

import java.math.BigDecimal;
import java.util.Map;

public class StudentFinancialSummaryDto {

    private String studentName;
    private String studentId;
    private String gradeLevel;

    // --- THIS IS THE FIX ---
    // The fields are now Maps to hold a balance for each currency (e.g., "USD" -> 100.00)
    private Map<String, BigDecimal> totalChargesByCurrency;
    private Map<String, BigDecimal> totalPaymentsByCurrency;
    private Map<String, BigDecimal> periodBalancesByCurrency;
    private Map<String, BigDecimal> outstandingBalances;

    // --- Getters and Setters for all fields ---

    public String getStudentName() {
        return studentName;
    }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    // Getters and setters for the new Map-based fields
    public Map<String, BigDecimal> getTotalChargesByCurrency() {
        return totalChargesByCurrency;
    }
    public void setTotalChargesByCurrency(Map<String, BigDecimal> totalChargesByCurrency) {
        this.totalChargesByCurrency = totalChargesByCurrency;
    }

    public Map<String, BigDecimal> getTotalPaymentsByCurrency() {
        return totalPaymentsByCurrency;
    }
    public void setTotalPaymentsByCurrency(Map<String, BigDecimal> totalPaymentsByCurrency) {
        this.totalPaymentsByCurrency = totalPaymentsByCurrency;
    }

    public Map<String, BigDecimal> getPeriodBalancesByCurrency() {
        return periodBalancesByCurrency;
    }
    public void setPeriodBalancesByCurrency(Map<String, BigDecimal> periodBalancesByCurrency) {
        this.periodBalancesByCurrency = periodBalancesByCurrency;
    }

    public Map<String, BigDecimal> getOutstandingBalances() {
        return outstandingBalances;
    }
    public void setOutstandingBalances(Map<String, BigDecimal> outstandingBalances) {
        this.outstandingBalances = outstandingBalances;
    }
}
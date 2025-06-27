package com.payments.dto;

import java.math.BigDecimal;

public class FinancialAnalyticsDto {
    private BigDecimal totalFeesCollected;
    private BigDecimal outstandingFees;
    private long totalTransactions;
    private BigDecimal monthlyRevenue; // Example field

    // Constructors
    public FinancialAnalyticsDto() {}

    // Getters and Setters
    public BigDecimal getTotalFeesCollected() { return totalFeesCollected; }
    public void setTotalFeesCollected(BigDecimal totalFeesCollected) { this.totalFeesCollected = totalFeesCollected; }
    public BigDecimal getOutstandingFees() { return outstandingFees; }
    public void setOutstandingFees(BigDecimal outstandingFees) { this.outstandingFees = outstandingFees; }
    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }
    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
}
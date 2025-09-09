package com.payments.dto;

import java.math.BigDecimal;
import java.util.Map;

public class StudentBalanceDto {
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String currentGrade;

    // FIX 1: The 'balance' field is now a Map to hold multiple currency balances.
    private Map<String, BigDecimal> balances;

    // FIX 2: The constructor now only takes the fields that come directly from the Student table.
    // The 'balances' map will be populated later by the FinancialService.
    public StudentBalanceDto(Long id, String studentId, String firstName, String lastName, String currentGrade) {
        this.id = id;
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.currentGrade = currentGrade;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getCurrentGrade() { return currentGrade; }
    public void setCurrentGrade(String currentGrade) { this.currentGrade = currentGrade; }

    // Getters and setters for the new 'balances' map
    public Map<String, BigDecimal> getBalances() { return balances; }
    public void setBalances(Map<String, BigDecimal> balances) { this.balances = balances; }
}
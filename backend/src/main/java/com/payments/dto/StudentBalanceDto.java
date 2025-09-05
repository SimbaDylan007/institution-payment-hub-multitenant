package com.payments.dto;

import java.math.BigDecimal;

// Removed @Data and added explicit methods
public class StudentBalanceDto {
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String currentGrade;
    private BigDecimal balance;

    public StudentBalanceDto(Long id, String studentId, String firstName, String lastName, String currentGrade, BigDecimal balance) {
        this.id = id;
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.currentGrade = currentGrade;
        this.balance = balance;
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
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
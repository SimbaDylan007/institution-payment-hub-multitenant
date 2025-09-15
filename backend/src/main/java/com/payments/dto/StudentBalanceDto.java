// src/main/java/com/payments/dto/StudentBalanceDto.java
package com.payments.dto;

import com.payments.model.StudentCategory;
import java.math.BigDecimal;
import java.util.Map;

public class StudentBalanceDto {
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String currentGrade;
    private StudentCategory category;
    private Map<String, BigDecimal> balances;

    // This constructor is now simpler
    public StudentBalanceDto(Long id, String studentId, String firstName, String lastName, String currentGrade, StudentCategory category) {
        this.id = id;
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.currentGrade = currentGrade;
        this.category = category;
    }

    // Getters and Setters
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
    public StudentCategory getCategory() { return category; }
    public void setCategory(StudentCategory category) { this.category = category; }
    public Map<String, BigDecimal> getBalances() { return balances; }
    public void setBalances(Map<String, BigDecimal> balances) { this.balances = balances; }
}
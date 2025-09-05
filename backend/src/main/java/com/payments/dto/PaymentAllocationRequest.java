package com.payments.dto;

public class PaymentAllocationRequest {
    private String paymentAlertId;
    private String studentId;

    // --- Getters and Setters ---
    public String getPaymentAlertId() { return paymentAlertId; }
    public void setPaymentAlertId(String paymentAlertId) { this.paymentAlertId = paymentAlertId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
}
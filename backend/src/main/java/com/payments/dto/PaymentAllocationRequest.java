package com.payments.dto;

public class PaymentAllocationRequest {
    private String paymentAlertId;
    private String studentId;

    private String academicYear;
    private String semester;

    // --- Getters and Setters for ALL fields ---
    public String getPaymentAlertId() { return paymentAlertId; }
    public void setPaymentAlertId(String paymentAlertId) { this.paymentAlertId = paymentAlertId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
}
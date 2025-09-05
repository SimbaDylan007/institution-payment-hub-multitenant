package com.payments.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

// Removed @Data and added explicit methods
public class BulkChargeRequest {
    private Long feeTypeId;
    private List<String> studentIds;
    private MultipartFile studentIdFile;

    // --- Getters and Setters ---
    public Long getFeeTypeId() { return feeTypeId; }
    public void setFeeTypeId(Long feeTypeId) { this.feeTypeId = feeTypeId; }
    public List<String> getStudentIds() { return studentIds; }
    public void setStudentIds(List<String> studentIds) { this.studentIds = studentIds; }
    public MultipartFile getStudentIdFile() { return studentIdFile; }
    public void setStudentIdFile(MultipartFile studentIdFile) { this.studentIdFile = studentIdFile; }
}
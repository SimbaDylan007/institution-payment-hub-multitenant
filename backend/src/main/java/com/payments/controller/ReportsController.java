package com.payments.controller;

import com.payments.dto.ReportCardDto;
import com.payments.service.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.payments.dto.StudentFinancialSummaryDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN', 'ADMINISTRATOR', 'TEACHER','SUPER_ADMIN')")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> request) {
        String reportType = (String) request.get("reportType");
        String academicYear = (String) request.get("academicYear");
        String semester = (String) request.get("semester");
        Long studentId = request.get("studentId") != null ? Long.parseLong(request.get("studentId").toString()) : null;

        if ("STUDENT_REPORT_CARD".equals(reportType)) {
            List<ReportCardDto> reportCards = reportsService.generateStudentReportCards(academicYear, semester, studentId);
            return ResponseEntity.ok(reportCards);
        }

        // --- NEW LOGIC for Financial Summary ---
        else if ("FINANCIAL_SUMMARY".equals(reportType)) {
            String gradeLevel = (String) request.get("gradeLevel");
            List<StudentFinancialSummaryDto> summaries = reportsService.generateFinancialSummary(academicYear, semester, studentId, gradeLevel);
            return ResponseEntity.ok(summaries);
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Unknown report type specified.");
        return ResponseEntity.badRequest().body(response);
    }
}
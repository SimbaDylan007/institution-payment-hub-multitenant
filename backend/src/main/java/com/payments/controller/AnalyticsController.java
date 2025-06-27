package com.payments.controller;

import com.payments.dto.*;
import com.payments.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/financial-analytics")
    public ResponseEntity<FinancialAnalyticsDto> getFinancialAnalytics() {
        FinancialAnalyticsDto data = analyticsService.getFinancialAnalytics();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/student-performance")
    public ResponseEntity<StudentPerformanceDto> getStudentPerformance() {
        StudentPerformanceDto data = analyticsService.getStudentPerformance();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/subject-analytics")
    public ResponseEntity<SubjectAnalyticsDto> getSubjectAnalytics() {
        SubjectAnalyticsDto data = analyticsService.getSubjectAnalytics();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/class-performance")
    public ResponseEntity<ClassPerformanceDto> getClassPerformance() {
        ClassPerformanceDto data = analyticsService.getClassPerformance();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/attendance-analytics")
    public ResponseEntity<AttendanceAnalyticsDto> getAttendanceAnalytics() {
        AttendanceAnalyticsDto data = analyticsService.getAttendanceAnalytics();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/resource-utilization")
    public ResponseEntity<ResourceUtilizationDto> getResourceUtilization() {
        ResourceUtilizationDto data = analyticsService.getResourceUtilization();
        return ResponseEntity.ok(data);
    }
}
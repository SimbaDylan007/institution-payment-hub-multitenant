package com.payments.controller;

import com.payments.model.AuditLog;
import com.payments.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action,
            // Receive the date part only from the frontend
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {

        // Convert LocalDate to LocalDateTime for the database query
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        // Set the end time to the very end of the selected day to ensure all of that day's logs are included
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        String usernameFilter = (username != null && !username.isEmpty()) ? username : null;
        String actionFilter = (action != null && !action.isEmpty()) ? action : null;

        Page<AuditLog> auditLogs = auditLogService.getAuditLogs(usernameFilter, actionFilter, startDateTime, endDateTime, pageable);
        return ResponseEntity.ok(auditLogs);
    }
}
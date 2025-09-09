package com.payments.controller;

import com.payments.dto.DashboardHubDto; // <-- Change import
import com.payments.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/hub") // <-- Renamed endpoint
    public ResponseEntity<DashboardHubDto> getDashboardHub() { // <-- Renamed method
        return ResponseEntity.ok(dashboardService.getDashboardHub());
    }
}
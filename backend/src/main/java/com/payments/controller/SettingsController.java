
package com.payments.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN')")
public class SettingsController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("schoolName", "Springfield High School");
        settings.put("address", "123 Education St, Springfield");
        settings.put("phone", "+1 (555) 123-4567");
        settings.put("email", "admin@springfield.edu");
        settings.put("website", "www.springfield.edu");
        settings.put("academicYear", "2024-2025");
        settings.put("currency", "USD");
        settings.put("timezone", "America/New_York");
        settings.put("maintenanceMode", false);
        settings.put("twoFactorEnabled", false);
        return ResponseEntity.ok(settings);
    }
    
    @PostMapping("/maintenance-mode")
    public ResponseEntity<Map<String, String>> toggleMaintenanceMode(@RequestBody Map<String, Boolean> request) {
        boolean enabled = request.get("enabled");
        return ResponseEntity.ok(Map.of("message", "Maintenance mode " + (enabled ? "enabled" : "disabled"), "status", "success"));
    }
    
    @PostMapping("/two-factor-auth")
    public ResponseEntity<Map<String, String>> toggleTwoFactorAuth(@RequestBody Map<String, Boolean> request) {
        boolean enabled = request.get("enabled");
        return ResponseEntity.ok(Map.of("message", "Two-factor authentication " + (enabled ? "enabled" : "disabled"), "status", "success"));
    }
    
    @PutMapping
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully", "status", "success"));
    }
}

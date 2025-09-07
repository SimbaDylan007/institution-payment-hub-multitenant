package com.payments.controller;

import com.payments.model.SystemSettings;
import com.payments.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR')") // Only admins can change settings
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService settingsService;

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSystemSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings newSettings) {
        return ResponseEntity.ok(settingsService.updateSystemSettings(newSettings));
    }
}
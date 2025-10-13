package com.payments.controller;

import com.payments.model.SystemSettings;
import com.payments.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-settings") // Changed path for clarity
@CrossOrigin(origins = "*")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService settingsService;

    /**
     * Endpoint for a regular admin to get the settings for THEIR OWN institution.
     * The service method determines the institution from the logged-in user.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR','SUPER_ADMIN')")
    public ResponseEntity<SystemSettings> getMyInstitutionSettings() {
        return ResponseEntity.ok(settingsService.getSystemSettingsForCurrentUser());
    }

    /**
     * Endpoint for a super-admin to get the settings for ANY institution by its ID.
     */
    @GetMapping("/{institutionId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SystemSettings> getSettingsForInstitution(@PathVariable Long institutionId) {
        // This requires the Institution entity to be passed to the service, or a findByInstitutionId method
        // Assuming getSystemSettingsForInstitution(institution) exists and handles creation if not found.
        // For simplicity, let's assume a direct find method.
        SystemSettings settings = settingsService.getSystemSettingsByInstitutionId(institutionId);
        return ResponseEntity.ok(settings);
    }


    /**
     * Endpoint for a regular admin to update the settings for THEIR OWN institution.
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR','SUPER_ADMIN')")
    public ResponseEntity<SystemSettings> updateMyInstitutionSettings(@RequestBody SystemSettings newSettings) {
        return ResponseEntity.ok(settingsService.updateSystemSettingsForCurrentUser(newSettings));
    }

    /**
     * Endpoint for a super-admin to update the settings for ANY institution by its ID.
     */
    @PutMapping("/{institutionId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SystemSettings> updateSettingsForInstitution(
            @PathVariable Long institutionId,
            @RequestBody SystemSettings newSettings) {
        return ResponseEntity.ok(settingsService.updateSystemSettingsForInstitution(institutionId, newSettings));
    }
}
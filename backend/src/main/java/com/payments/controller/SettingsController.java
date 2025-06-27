package com.payments.controller;

// All necessary imports for the controller
import com.payments.dto.*;
import com.payments.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    @Autowired
    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    // --- School Information Endpoints --- (THIS WAS MISSING)
    @GetMapping("/school-info")
    public ResponseEntity<SchoolInformationDto> getSchoolInformation() {
        return settingsService.getSchoolInformation()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new SchoolInformationDto()));
    }

    @PutMapping("/school-info")
    public ResponseEntity<SchoolInformationDto> saveSchoolInformation(@RequestBody SchoolInformationDto dto) {
        return ResponseEntity.ok(settingsService.saveSchoolInformation(dto));
    }

    // --- System Preferences Endpoints --- (THIS WAS MISSING)
    @GetMapping("/system-preferences")
    public ResponseEntity<SystemPreferencesDto> getSystemPreferences() {
        return settingsService.getSystemPreferences()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new SystemPreferencesDto()));
    }

    @PutMapping("/system-preferences")
    public ResponseEntity<SystemPreferencesDto> saveSystemPreferences(@RequestBody SystemPreferencesDto dto) {
        return ResponseEntity.ok(settingsService.saveSystemPreferences(dto));
    }

    // --- Notification Preferences Endpoints --- (THIS WAS MISSING)
    @GetMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesDto> getNotificationPreferences() {
        return settingsService.getNotificationPreferences()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new NotificationPreferencesDto()));
    }

    @PutMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesDto> saveNotificationPreferences(@RequestBody NotificationPreferencesDto dto) {
        return ResponseEntity.ok(settingsService.saveNotificationPreferences(dto));
    }

    // --- Password Policy Endpoints --- (This was correct)
    @GetMapping("/security/password-policy")
    public ResponseEntity<PasswordPolicyDto> getPasswordPolicy() {
        return settingsService.getPasswordPolicy()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new PasswordPolicyDto()));
    }

    @PutMapping("/security/password-policy")
    public ResponseEntity<PasswordPolicyDto> savePasswordPolicy(@RequestBody PasswordPolicyDto dto) {
        return ResponseEntity.ok(settingsService.savePasswordPolicy(dto));
    }

    // --- Security Features Endpoints --- (This was correct)
    @GetMapping("/security/features")
    public ResponseEntity<SecurityFeaturesDto> getSecurityFeatures() {
        return settingsService.getSecurityFeatures()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new SecurityFeaturesDto()));
    }

    @PutMapping("/security/features")
    public ResponseEntity<SecurityFeaturesDto> saveSecurityFeatures(@RequestBody SecurityFeaturesDto dto) {
        return ResponseEntity.ok(settingsService.saveSecurityFeatures(dto));
    }
}
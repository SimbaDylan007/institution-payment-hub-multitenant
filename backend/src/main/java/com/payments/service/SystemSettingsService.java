package com.payments.service;
import com.payments.model.SystemSettings;
import com.payments.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class SystemSettingsService {

    private static final Long SETTINGS_ID = 1L;

    @Autowired
    private SystemSettingsRepository settingsRepository;

    // Method to get the current settings
    public SystemSettings getSystemSettings() {
        return settingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> {
                    // Create default settings if they don't exist
                    SystemSettings defaultSettings = new SystemSettings();
                    defaultSettings.setId(SETTINGS_ID);
                    defaultSettings.setCurrentAcademicYear("2024-2025");
                    defaultSettings.setCurrentSemester("SEMESTER_1");
                    return settingsRepository.save(defaultSettings);
                });
    }

    // Method to update the settings
    @Transactional
    public SystemSettings updateSystemSettings(SystemSettings newSettings) {
        SystemSettings settings = getSystemSettings();
        settings.setCurrentAcademicYear(newSettings.getCurrentAcademicYear());
        settings.setCurrentSemester(newSettings.getCurrentSemester());
        return settingsRepository.save(settings);
    }
}
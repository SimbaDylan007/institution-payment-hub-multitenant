package com.payments.service;

import com.payments.model.Institution;
import com.payments.model.SystemSettings;
import com.payments.model.User;
import com.payments.repository.SystemSettingsRepository;
import com.payments.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;

@Service
public class SystemSettingsService {

    @Autowired private SystemSettingsRepository settingsRepository;
    @Autowired private UserRepository userRepository; // <-- Inject

    /**
     * Retrieves the settings for the currently logged-in user's institution.
     * If a super-admin is logged in, this will fail as they have no institution.
     * Super-admins must manage settings via a dedicated endpoint that specifies the institution ID.
     */
    public SystemSettings getSystemSettingsForCurrentUser() {
        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null) {
            throw new IllegalStateException("User does not belong to an institution.");
        }
        return getSystemSettingsForInstitution(institution);
    }

    public SystemSettings getSystemSettingsByInstitutionId(Long institutionId) {
        Institution institution = new Institution();
        institution.setId(institutionId);
        return getSystemSettingsForInstitution(institution);
    }

    @Transactional
    public SystemSettings updateSystemSettingsForCurrentUser(SystemSettings newSettings) {
        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null) {
            throw new IllegalStateException("User does not belong to an institution.");
        }
        return updateSystemSettingsForInstitution(institution.getId(), newSettings);
    }

    /**
     * Retrieves or creates default settings for a specific institution.
     * This is the method that should be used by other services like ReconciliationService.
     * @param institution The institution for which to get settings.
     */
    public SystemSettings getSystemSettingsForInstitution(Institution institution) {
        return settingsRepository.findByInstitution(institution)
                .orElseGet(() -> createDefaultSettingsForInstitution(institution));
    }

    /**
     * Updates the settings for a specific institution. This method would be called by a super-admin controller.
     * @param institutionId The ID of the institution to update.
     * @param newSettings The new settings data.
     */
    @Transactional
    public SystemSettings updateSystemSettingsForInstitution(Long institutionId, SystemSettings newSettings) {
        SystemSettings settings = settingsRepository.findByInstitutionId(institutionId)
                .orElseThrow(() -> new RuntimeException("Settings not found for institution ID: " + institutionId));

        settings.setCurrentAcademicYear(newSettings.getCurrentAcademicYear());
        settings.setCurrentSemester(newSettings.getCurrentSemester());
        return settingsRepository.save(settings);
    }

    /**
     * Helper method to create and save a default settings record for a new institution.
     */
    private SystemSettings createDefaultSettingsForInstitution(Institution institution) {
        SystemSettings defaultSettings = new SystemSettings();
        defaultSettings.setInstitution(institution);

        LocalDate now = LocalDate.now();
        int year = now.getYear();
        Month month = now.getMonth();

        String currentAcademicYear = (month.getValue() >= 9) ? (year + "-" + (year + 1)) : ((year - 1) + "-" + year);
        defaultSettings.setCurrentAcademicYear(currentAcademicYear);

        String currentSemester;
        if (month.getValue() <= 4) currentSemester = "SEMESTER_1";
        else if (month.getValue() <= 8) currentSemester = "SEMESTER_2";
        else currentSemester = "SEMESTER_3";
        defaultSettings.setCurrentSemester(currentSemester);

        return settingsRepository.save(defaultSettings);
    }

    // --- HELPER METHOD ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }
}
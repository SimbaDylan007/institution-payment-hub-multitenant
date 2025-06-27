package com.payments.service;

// All necessary imports
import com.payments.dto.*;
import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class SettingsService {

    private final SchoolInformationRepository schoolInformationRepository;
    private final SystemPreferencesRepository systemPreferencesRepository;
    private final NotificationPreferencesRepository notificationPreferencesRepository;
    private final PasswordPolicyRepository passwordPolicyRepository;
    private final SecurityFeaturesRepository securityFeaturesRepository;

    private static final Long FIXED_ID = 1L;

    @Autowired
    public SettingsService(SchoolInformationRepository schoolInformationRepository,
                           SystemPreferencesRepository systemPreferencesRepository,
                           NotificationPreferencesRepository notificationPreferencesRepository,
                           PasswordPolicyRepository passwordPolicyRepository,
                           SecurityFeaturesRepository securityFeaturesRepository) {
        this.schoolInformationRepository = schoolInformationRepository;
        this.systemPreferencesRepository = systemPreferencesRepository;
        this.notificationPreferencesRepository = notificationPreferencesRepository;
        this.passwordPolicyRepository = passwordPolicyRepository;
        this.securityFeaturesRepository = securityFeaturesRepository;
    }

    // --- School Information --- (THIS WAS MISSING)
    public Optional<SchoolInformationDto> getSchoolInformation() {
        return schoolInformationRepository.findById(FIXED_ID).map(this::convertToSchoolDto);
    }

    @Transactional
    public SchoolInformationDto saveSchoolInformation(SchoolInformationDto dto) {
        SchoolInformation info = schoolInformationRepository.findById(FIXED_ID)
                .orElseGet(() -> {
                    SchoolInformation newInfo = new SchoolInformation();
                    newInfo.setId(FIXED_ID);
                    return newInfo;
                });
        info.setSchoolName(dto.getSchoolName());
        info.setSchoolAddress(dto.getSchoolAddress());
        info.setSchoolPhone(dto.getSchoolPhone());
        return convertToSchoolDto(schoolInformationRepository.save(info));
    }

    private SchoolInformationDto convertToSchoolDto(SchoolInformation entity) {
        SchoolInformationDto dto = new SchoolInformationDto();
        dto.setSchoolName(entity.getSchoolName());
        dto.setSchoolAddress(entity.getSchoolAddress());
        dto.setSchoolPhone(entity.getSchoolPhone());
        return dto;
    }

    // --- System Preferences --- (THIS WAS MISSING)
    public Optional<SystemPreferencesDto> getSystemPreferences() {
        return systemPreferencesRepository.findById(FIXED_ID).map(this::convertToPrefsDto);
    }

    @Transactional
    public SystemPreferencesDto saveSystemPreferences(SystemPreferencesDto dto) {
        SystemPreferences prefs = systemPreferencesRepository.findById(FIXED_ID)
                .orElseGet(() -> {
                    SystemPreferences newPrefs = new SystemPreferences();
                    newPrefs.setId(FIXED_ID);
                    return newPrefs;
                });
        prefs.setAcademicYear(dto.getAcademicYear());
        prefs.setTimeZone(dto.getTimeZone());
        prefs.setLanguage(dto.getLanguage());
        return convertToPrefsDto(systemPreferencesRepository.save(prefs));
    }

    private SystemPreferencesDto convertToPrefsDto(SystemPreferences entity) {
        SystemPreferencesDto dto = new SystemPreferencesDto();
        dto.setAcademicYear(entity.getAcademicYear());
        dto.setTimeZone(entity.getTimeZone());
        dto.setLanguage(entity.getLanguage());
        return dto;
    }

    // --- Notification Preferences --- (THIS WAS MISSING)
    public Optional<NotificationPreferencesDto> getNotificationPreferences() {
        return notificationPreferencesRepository.findById(FIXED_ID).map(this::convertToNotificationPrefsDto);
    }

    @Transactional
    public NotificationPreferencesDto saveNotificationPreferences(NotificationPreferencesDto dto) {
        NotificationPreferences prefs = notificationPreferencesRepository.findById(FIXED_ID)
                .orElseGet(() -> {
                    NotificationPreferences newPrefs = new NotificationPreferences();
                    newPrefs.setId(FIXED_ID);
                    return newPrefs;
                });
        prefs.setNewStudentEmail(dto.isNewStudentEmail());
        prefs.setGradeUpdatesEmail(dto.isGradeUpdatesEmail());
        prefs.setAttendanceEmail(dto.isAttendanceEmail());
        prefs.setEmergencyEmail(dto.isEmergencyEmail());
        prefs.setEmergencySMS(dto.isEmergencySMS());
        prefs.setAttendanceSMS(dto.isAttendanceSMS());
        prefs.setEventReminderSMS(dto.isEventReminderSMS());
        prefs.setGradeSMS(dto.isGradeSMS());
        return convertToNotificationPrefsDto(notificationPreferencesRepository.save(prefs));
    }

    private NotificationPreferencesDto convertToNotificationPrefsDto(NotificationPreferences entity) {
        NotificationPreferencesDto dto = new NotificationPreferencesDto();
        dto.setNewStudentEmail(entity.isNewStudentEmail());
        dto.setGradeUpdatesEmail(entity.isGradeUpdatesEmail());
        dto.setAttendanceEmail(entity.isAttendanceEmail());
        dto.setEmergencyEmail(entity.isEmergencyEmail());
        dto.setEmergencySMS(entity.isEmergencySMS());
        dto.setAttendanceSMS(entity.isAttendanceSMS());
        dto.setEventReminderSMS(entity.isEventReminderSMS());
        dto.setGradeSMS(entity.isGradeSMS());
        return dto;
    }

    // --- Password Policy --- (This was correct)
    public Optional<PasswordPolicyDto> getPasswordPolicy() {
        return passwordPolicyRepository.findById(FIXED_ID).map(this::convertToPasswordPolicyDto);
    }

    @Transactional
    public PasswordPolicyDto savePasswordPolicy(PasswordPolicyDto dto) {
        PasswordPolicy policy = passwordPolicyRepository.findById(FIXED_ID)
                .orElseGet(() -> {
                    PasswordPolicy newPolicy = new PasswordPolicy();
                    newPolicy.setId(FIXED_ID);
                    return newPolicy;
                });
        policy.setMinLength(dto.getMinLength());
        policy.setRequireSpecialChars(dto.isRequireSpecialChars());
        policy.setRequireNumbers(dto.isRequireNumbers());
        policy.setRequireUppercase(dto.isRequireUppercase());
        policy.setRequireLowercase(dto.isRequireLowercase());
        return convertToPasswordPolicyDto(passwordPolicyRepository.save(policy));
    }

    private PasswordPolicyDto convertToPasswordPolicyDto(PasswordPolicy entity) {
        PasswordPolicyDto dto = new PasswordPolicyDto();
        dto.setMinLength(entity.getMinLength());
        dto.setRequireSpecialChars(entity.isRequireSpecialChars());
        dto.setRequireNumbers(entity.isRequireNumbers());
        dto.setRequireUppercase(entity.isRequireUppercase());
        dto.setRequireLowercase(entity.isRequireLowercase());
        return dto;
    }

    // --- Security Features --- (This was correct)
    public Optional<SecurityFeaturesDto> getSecurityFeatures() {
        return securityFeaturesRepository.findById(FIXED_ID).map(this::convertToSecurityFeaturesDto);
    }

    @Transactional
    public SecurityFeaturesDto saveSecurityFeatures(SecurityFeaturesDto dto) {
        SecurityFeatures features = securityFeaturesRepository.findById(FIXED_ID)
                .orElseGet(() -> {
                    SecurityFeatures newFeatures = new SecurityFeatures();
                    newFeatures.setId(FIXED_ID);
                    return newFeatures;
                });
        features.setEnableTwoFactorAuth(dto.isEnableTwoFactorAuth());
        features.setEnableSessionTimeout(dto.isEnableSessionTimeout());
        features.setLogSecurityEvents(dto.isLogSecurityEvents());
        return convertToSecurityFeaturesDto(securityFeaturesRepository.save(features));
    }

    private SecurityFeaturesDto convertToSecurityFeaturesDto(SecurityFeatures entity) {
        SecurityFeaturesDto dto = new SecurityFeaturesDto();
        dto.setEnableTwoFactorAuth(entity.isEnableTwoFactorAuth());
        dto.setEnableSessionTimeout(entity.isEnableSessionTimeout());
        dto.setLogSecurityEvents(entity.isLogSecurityEvents());
        return dto;
    }
}
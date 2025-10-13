package com.payments.config;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.payments.service.UserService;
import java.util.Arrays;
import java.util.List;


@Component
public class DataInitializer implements CommandLineRunner {

    private final PasswordPolicyRepository passwordPolicyRepository;
    private final SecurityFeaturesRepository securityFeaturesRepository;
    private final InstitutionRepository institutionRepository;
    private final SchoolInformationRepository schoolInformationRepository;
    private final SystemPreferencesRepository systemPreferencesRepository;
    private final NotificationPreferencesRepository notificationPreferencesRepository;
    private final RoleRepository roleRepository; // For initializing roles

    public DataInitializer(PasswordPolicyRepository passwordPolicyRepository,
                           SecurityFeaturesRepository securityFeaturesRepository,
                           SchoolInformationRepository schoolInformationRepository,
                           SystemPreferencesRepository systemPreferencesRepository,
                           NotificationPreferencesRepository notificationPreferencesRepository,
                           RoleRepository roleRepository,
                           InstitutionRepository institutionRepository) {
        this.passwordPolicyRepository = passwordPolicyRepository;
        this.securityFeaturesRepository = securityFeaturesRepository;
        this.schoolInformationRepository = schoolInformationRepository;
        this.systemPreferencesRepository = systemPreferencesRepository;
        this.notificationPreferencesRepository = notificationPreferencesRepository;
        this.roleRepository = roleRepository;
        this.institutionRepository = institutionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // --- Create a Master Institution for Global Roles ---
        Institution masterInstitution = institutionRepository.findByName("Master Institution").orElseGet(() -> {
            Institution newInst = new Institution();
            newInst.setName("Master Institution");
            newInst.setAddress("System Address");
            newInst.setSchoolEmail("system@system.com");
            System.out.println("Creating Master Institution.");
            return institutionRepository.save(newInst);
        });

        // --- Initialize Roles ---
        List<String> roleNames = Arrays.asList(
                "ROLE_ADMIN", "ROLE_IT_ADMIN", "ROLE_FINANCE_ADMIN",
                "ROLE_ADMINISTRATOR", "ROLE_TEACHER", "ROLE_STUDENT", "ROLE_SUPER_ADMIN"
        );

        for (String roleName : roleNames) {
            // Use the new, correct method here to avoid ambiguity
            if (roleRepository.findByNameAndInstitution(roleName, masterInstitution).isEmpty()) {
                Role newRole = new Role(roleName);
                newRole.setInstitution(masterInstitution);
                roleRepository.save(newRole);
                System.out.println("Created role: " + roleName + " for " + masterInstitution.getName());
            }
        }

        // Initialize Password Policy if not present
        if (passwordPolicyRepository.findById(1L).isEmpty()) {
            PasswordPolicy defaultPolicy = new PasswordPolicy();
            defaultPolicy.setId(1L);
            // Set other defaults if desired, otherwise uses entity defaults
            passwordPolicyRepository.save(defaultPolicy);
            System.out.println("Initialized default password policy.");
        }

        // Initialize Security Features if not present
        if (securityFeaturesRepository.findById(1L).isEmpty()) {
            SecurityFeatures defaultFeatures = new SecurityFeatures();
            defaultFeatures.setId(1L);
            securityFeaturesRepository.save(defaultFeatures);
            System.out.println("Initialized default security features.");
        }

        // Initialize other FIXED_ID settings entities
        if (schoolInformationRepository.findById(1L).isEmpty()) {
            SchoolInformation info = new SchoolInformation(); info.setId(1L); info.setSchoolName("Default School");
            schoolInformationRepository.save(info); System.out.println("Initialized default school info.");
        }
        if (systemPreferencesRepository.findById(1L).isEmpty()) {
            SystemPreferences prefs = new SystemPreferences(); prefs.setId(1L); prefs.setAcademicYear("2024-2025");
            systemPreferencesRepository.save(prefs); System.out.println("Initialized default system prefs.");
        }
        if (notificationPreferencesRepository.findById(1L).isEmpty()) {
            NotificationPreferences nPrefs = new NotificationPreferences(); nPrefs.setId(1L);
            notificationPreferencesRepository.save(nPrefs); System.out.println("Initialized default notification prefs.");
        }
    }
}
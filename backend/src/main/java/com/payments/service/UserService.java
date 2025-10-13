package com.payments.service;

import com.payments.dto.UserStatisticsDto;
import com.payments.dto.UserCreationDto;
import com.payments.dto.BulkUserImportDto;
import com.payments.dto.UserRoleAssignmentDto;
import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import javax.persistence.EntityNotFoundException;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionRepository institutionRepository;


    // --- COMPLETE ROLE CONSTANTS ---
    public static final String ROLE_NAME_ADMIN = "ROLE_ADMIN"; // Super User
    public static final String ROLE_NAME_IT_ADMIN = "ROLE_IT_ADMIN"; // User management, settings
    public static final String ROLE_NAME_FINANCE_ADMIN = "ROLE_FINANCE_ADMIN"; // Finance, reconciliation
    public static final String ROLE_NAME_ADMINISTRATOR = "ROLE_ADMINISTRATOR"; // Facilities, Academics, Library
    public static final String ROLE_NAME_TEACHER = "ROLE_TEACHER"; // Academics, Schedule
    public static final String ROLE_NAME_STUDENT = "ROLE_STUDENT"; // Default role for new users

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, InstitutionRepository institutionRepository) { // 2. ADD TO CONSTRUCTOR
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.institutionRepository = institutionRepository;
    }

    /**
     * Calculates user statistics for a SINGLE, specific institution.
     * This method is called when a Super Admin selects an institution or when a normal Admin logs in.
     *
     * @param institutionId The ID of the institution to get statistics for.
     * @return A DTO containing the calculated statistics.
     */
    public UserStatisticsDto getUserStatistics(Long institutionId) {
        // Count total and active users for this specific institution.
        long totalUsers = userRepository.countByInstitutionId(institutionId);
        long activeUsers = userRepository.countByInstitutionIdAndEnabled(institutionId, true);

        // Count users with specific roles within this institution.
        long administrators = userRepository.countUsersByRoleNameAndInstitutionId("ROLE_ADMIN", institutionId);
        long teachers = userRepository.countUsersByRoleNameAndInstitutionId("ROLE_TEACHER", institutionId);

        return new UserStatisticsDto(totalUsers, activeUsers, administrators, teachers);
    }

    /**
     * Calculates user statistics for the ENTIRE system across ALL institutions.
     * This method is only called when a Super Admin is in the "All Institutions View".
     *
     * @return A DTO containing the global statistics.
     */
    public UserStatisticsDto getGlobalUserStatistics() {
        // Count total and active users across all institutions.
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);

        // Count users with specific roles across all institutions.
        long administrators = userRepository.countUsersByRoleName("ROLE_ADMIN");
        long teachers = userRepository.countUsersByRoleName("ROLE_TEACHER");

        return new UserStatisticsDto(totalUsers, activeUsers, administrators, teachers);
    }

    public List<User> getAllUsersInInstitution(Long institutionId) {
        return userRepository.findAllByInstitutionId(institutionId);
    }

    // We can keep a global method for the superadmin if needed
    public List<User> getAllUsersGlobally() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(UserCreationDto dto) {
        if (dto.getInstitutionId() == null) {
            throw new IllegalArgumentException("Institution ID is required to create a new user.");
        }
        Institution institution = institutionRepository.findById(dto.getInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Institution not found with ID: " + dto.getInstitutionId()));

        if (userRepository.findByUsernameAndInstitution(dto.getUsername(), institution).isPresent()) {
            throw new IllegalArgumentException("Username '" + dto.getUsername() + "' already exists in this institution.");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setEnabled(dto.isEnabled() != null ? dto.isEnabled() : true);
        user.setInstitution(institution);

        if (dto.getRoleNames() != null && !dto.getRoleNames().isEmpty()) {
            Set<Role> roles = dto.getRoleNames().stream()
                    .map(roleName -> roleRepository.findByNameAndInstitution(roleName, institution)
                            .orElseThrow(() -> new EntityNotFoundException("Role '" + roleName + "' not found for this institution.")))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    public List<User> getUsersByInstitution(Long institutionId) {
        return userRepository.findAllByInstitutionId(institutionId);
    }

    @Transactional
    public User updateUser(Long id, UserCreationDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        Institution institution = user.getInstitution();
        user.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setEmail(dto.getEmail());
        if (dto.isEnabled() != null) {
            user.setEnabled(dto.isEnabled());
        }
        if (dto.getRoleNames() != null) {
            Set<Role> roles = dto.getRoleNames().stream()
                    .map(roleName -> roleRepository.findByNameAndInstitution(roleName, institution)
                            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleName)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        return userRepository.save(user);
    }


    @Transactional
    public User assignRoles(UserRoleAssignmentDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        Institution institution = user.getInstitution();
        Set<Role> rolesToAssign = dto.getRoleNames().stream()
                .map(roleName -> roleRepository.findByNameAndInstitution(roleName, institution)
                        .orElseThrow(() -> new EntityNotFoundException("Role '" + roleName + "' not found for this institution.")))
                .collect(Collectors.toSet());
        user.setRoles(rolesToAssign);
        return userRepository.save(user);
    }

    @Transactional
    public List<User> bulkImportUsers(BulkUserImportDto dto) {
        List<User> createdUsers = new ArrayList<>();
        for (UserCreationDto userDto : dto.getUsers()) {
            try {
                createdUsers.add(createUser(userDto));
            } catch (Exception e) {
                System.err.println("Failed to create user: " + userDto.getUsername() + " - " + e.getMessage());
            }
        }
        return createdUsers;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional
    public Role createRole(String roleName, Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found with ID " + institutionId));
        String formattedRoleName = roleName.trim().toUpperCase();
        if (!formattedRoleName.startsWith("ROLE_")) { formattedRoleName = "ROLE_" + formattedRoleName; }
        if (roleRepository.findByNameAndInstitution(formattedRoleName, institution).isPresent()) {
            throw new IllegalStateException("Role '" + formattedRoleName + "' already exists for this institution.");
        }
        Role newRole = new Role(formattedRoleName);
        newRole.setInstitution(institution);
        return roleRepository.save(newRole);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User registerUser(String username, String password, String email, Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found with ID: " + institutionId));
        if (userRepository.findByUsernameAndInstitution(username, institution).isPresent()){
            throw new IllegalArgumentException("Username already exists for this institution.");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setEnabled(true);
        user.setInstitution(institution);
        roleRepository.findByNameAndInstitution(ROLE_NAME_STUDENT, institution).ifPresent(user::addRole);
        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

}
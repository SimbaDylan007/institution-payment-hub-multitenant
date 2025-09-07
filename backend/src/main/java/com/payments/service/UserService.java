package com.payments.service;

import com.payments.dto.UserStatisticsDto;
import com.payments.dto.UserCreationDto;
import com.payments.dto.BulkUserImportDto;
import com.payments.dto.UserRoleAssignmentDto;
import com.payments.model.Role;
import com.payments.model.User;
import com.payments.repository.RoleRepository;
import com.payments.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // --- COMPLETE ROLE CONSTANTS ---
    public static final String ROLE_NAME_ADMIN = "ROLE_ADMIN"; // Super User
    public static final String ROLE_NAME_IT_ADMIN = "ROLE_IT_ADMIN"; // User management, settings
    public static final String ROLE_NAME_FINANCE_ADMIN = "ROLE_FINANCE_ADMIN"; // Finance, reconciliation
    public static final String ROLE_NAME_ADMINISTRATOR = "ROLE_ADMINISTRATOR"; // Facilities, Academics, Library
    public static final String ROLE_NAME_TEACHER = "ROLE_TEACHER"; // Academics, Schedule
    public static final String ROLE_NAME_STUDENT = "ROLE_STUDENT"; // Default role for new users

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserStatisticsDto getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);

        Role adminRole = roleRepository.findByName(ROLE_NAME_ADMIN).orElse(null);
        Role teacherRole = roleRepository.findByName(ROLE_NAME_TEACHER).orElse(null);

        long administrators = (adminRole != null) ? userRepository.countByRolesContaining(adminRole) : 0;
        long teachers = (teacherRole != null) ? userRepository.countByRolesContaining(teacherRole) : 0;

        return new UserStatisticsDto(totalUsers, activeUsers, administrators, teachers);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(UserCreationDto dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setEnabled(dto.isEnabled());

        Set<Role> roles = new HashSet<>();
        if (dto.getRoleNames() != null) {
            for (String roleName : dto.getRoleNames()) {
                roleRepository.findByName(roleName).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, UserCreationDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setEmail(dto.getEmail());
        user.setEnabled(dto.isEnabled());

        Set<Role> roles = new HashSet<>();
        if (dto.getRoleNames() != null) {
            for (String roleName : dto.getRoleNames()) {
                roleRepository.findByName(roleName).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    public User assignRoles(UserRoleAssignmentDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));

        Set<Role> rolesToAssign = dto.getRoleNames().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
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
    public Role createRole(String roleName) {
        String formattedRoleName = roleName.trim().toUpperCase();
        if (!formattedRoleName.startsWith("ROLE_")) {
            formattedRoleName = "ROLE_" + formattedRoleName;
        }

        if (roleRepository.findByName(formattedRoleName).isPresent()) {
            throw new IllegalStateException("Role '" + formattedRoleName + "' already exists.");
        }

        Role newRole = new Role(formattedRoleName);
        return roleRepository.save(newRole);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User registerUser(String username, String password, String email) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setEnabled(true);

        roleRepository.findByName(ROLE_NAME_STUDENT).ifPresent(user::addRole);

        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    public Map<String, Long> getUserStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("activeUsers", userRepository.countByEnabled(true));
        stats.put("inactiveUsers", userRepository.countByEnabled(false));
        roleRepository.findByName(ROLE_NAME_ADMIN).ifPresent(role -> stats.put("adminCount", userRepository.countByRolesContaining(role)));
        roleRepository.findByName(ROLE_NAME_TEACHER).ifPresent(role -> stats.put("teacherCount", userRepository.countByRolesContaining(role)));
        stats.put("totalUsers", userRepository.count());
        return stats;
    }
}
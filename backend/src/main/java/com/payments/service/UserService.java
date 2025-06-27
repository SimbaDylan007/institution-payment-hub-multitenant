package com.payments.service;

import com.payments.dto.UserStatisticsDto;
import com.payments.model.Role;
import com.payments.repository.RoleRepository;
import com.payments.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // Define your role names (these should match what's in your DB or Role entity)
    public static final String ROLE_NAME_ADMIN = "ROLE_ADMIN"; // Or just "ADMIN"
    public static final String ROLE_NAME_TEACHER = "ROLE_TEACHER"; // Or just "TEACHER"


    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public UserStatisticsDto getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);

        // Fetch Role entities once
        Role adminRole = roleRepository.findByName(ROLE_NAME_ADMIN).orElse(null);
        Role teacherRole = roleRepository.findByName(ROLE_NAME_TEACHER).orElse(null);

        long administrators = 0;
        if (adminRole != null) {
            administrators = userRepository.countByRolesContaining(adminRole);
            // If using String role: administrators = userRepository.countByRole(ROLE_NAME_ADMIN);
        }

        long teachers = 0;
        if (teacherRole != null) {
            teachers = userRepository.countByRolesContaining(teacherRole);
            // If using String role: teachers = userRepository.countByRole(ROLE_NAME_TEACHER);
        }

        return new UserStatisticsDto(totalUsers, activeUsers, administrators, teachers);
    }

    // Placeholder for other user management methods that would be called by more specific actions
    // public User addUser(UserCreationDto dto) { /* ... */ return null;}
    // public User updateUserRoles(Long userId, List<String> roleNames) { /* ... */ return null;}
}
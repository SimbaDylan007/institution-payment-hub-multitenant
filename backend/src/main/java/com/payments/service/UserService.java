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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // Define your role names (these should match what's in your DB or Role entity)
    public static final String ROLE_NAME_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_NAME_TEACHER = "ROLE_TEACHER";
    public static final String ROLE_NAME_STUDENT = "ROLE_STUDENT";

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
        }

        long teachers = 0;
        if (teacherRole != null) {
            teachers = userRepository.countByRolesContaining(teacherRole);
        }

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
        user.setPassword(dto.getPassword()); // In real app, hash this password
        user.setEnabled(dto.isEnabled());

        // Assign roles
        Set<Role> roles = new HashSet<>();
        if (dto.getRoleNames() != null) {
            for (String roleName : dto.getRoleNames()) {
                Role role = roleRepository.findByName(roleName).orElse(null);
                if (role != null) {
                    roles.add(role);
                }
            }
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, UserCreationDto dto) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setUsername(dto.getUsername());
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                user.setPassword(dto.getPassword()); // Hash in real app
            }
            user.setEnabled(dto.isEnabled());

            // Update roles
            Set<Role> roles = new HashSet<>();
            if (dto.getRoleNames() != null) {
                for (String roleName : dto.getRoleNames()) {
                    Role role = roleRepository.findByName(roleName).orElse(null);
                    if (role != null) {
                        roles.add(role);
                    }
                }
            }
            user.setRoles(roles);

            return userRepository.save(user);
        }
        return null;
    }

    @Transactional
    public User assignRoles(UserRoleAssignmentDto dto) {
        Optional<User> optionalUser = userRepository.findById(dto.getUserId());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Set<Role> roles = new HashSet<>();
            
            for (String roleName : dto.getRoleNames()) {
                Role role = roleRepository.findByName(roleName).orElse(null);
                if (role != null) {
                    roles.add(role);
                }
            }
            user.setRoles(roles);
            return userRepository.save(user);
        }
        return null;
    }

    @Transactional
    public List<User> bulkImportUsers(BulkUserImportDto dto) {
        List<User> createdUsers = new ArrayList<>();
        
        for (UserCreationDto userDto : dto.getUsers()) {
            try {
                User user = createUser(userDto);
                createdUsers.add(user);
                
                // In a real application, you might send welcome emails here
                if (dto.isSendWelcomeEmail()) {
                    // sendWelcomeEmail(user);
                }
            } catch (Exception e) {
                // Log error but continue with other users
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
        Role role = new Role(roleName);
        return roleRepository.save(role);
    }

    public Optional<User> authenticateUser(String username, String password) {
        // In a real application, you would hash the password and compare hashes
        // For now, we'll do a simple comparison
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> user.getUsername().equals(username) && 
                               user.getPassword().equals(password) &&
                               user.isEnabled())
                .findFirst();
    }

    public Optional<User> getUserByUsername(String username) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    @Transactional
    public User registerUser(String username, String password, String email) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // In real app, hash this password
        user.setEnabled(true);

        // Assign default student role
        Role studentRole = roleRepository.findByName(ROLE_NAME_STUDENT).orElse(null);
        if (studentRole != null) {
            user.addRole(studentRole);
        }

        return userRepository.save(user);
    }
}

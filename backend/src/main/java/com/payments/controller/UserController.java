package com.payments.controller;

import com.payments.dto.UserStatisticsDto;
import com.payments.dto.UserCreationDto;
import com.payments.dto.BulkUserImportDto;
import com.payments.dto.UserRoleAssignmentDto;
import com.payments.model.Role;
import com.payments.model.User;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map; // Import Map for the new endpoint
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Note: Consider making this more specific than "*" for production
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN')") // Only ADMIN and IT_ADMIN can access these endpoints
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // This endpoint now correctly matches what we built in the UserService
    @GetMapping("/statistics")
    public ResponseEntity<UserStatisticsDto> getUserStatistics() {
        return ResponseEntity.ok(userService.getUserStatistics());
    }


    @GetMapping("/monthly-stats")
    public ResponseEntity<?> getMonthlyStats() {

        System.out.println("DEBUG: /api/users/monthly-stats was called. Redirecting to general statistics for now.");
        return ResponseEntity.ok(userService.getUserStatistics());


    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // --- FIX FOR THE PATH VARIABLE CONFLICT ---
    @GetMapping("/{id:\\d+}") // The regex \\d+ ensures this only matches numeric IDs
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserCreationDto userDto) {
        User createdUser = userService.createUser(userDto);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{id:\\d+}") // Also a good idea to add the regex here
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserCreationDto userDto) {
        User updatedUser = userService.updateUser(id, userDto);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/assign-roles")
    public ResponseEntity<User> assignRoles(@RequestBody UserRoleAssignmentDto dto) {
        User updatedUser = userService.assignRoles(dto);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<List<User>> bulkImportUsers(@RequestBody BulkUserImportDto dto) {
        List<User> createdUsers = userService.bulkImportUsers(dto);
        return ResponseEntity.ok(createdUsers);
    }

    @DeleteMapping("/{id:\\d+}") // And here
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody String roleName) {
        Role createdRole = userService.createRole(roleName);
        return ResponseEntity.ok(createdRole);
    }
}
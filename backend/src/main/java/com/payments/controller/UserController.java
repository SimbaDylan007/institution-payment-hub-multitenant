package com.payments.controller;

import com.payments.dto.UserStatisticsDto;
import com.payments.dto.UserCreationDto;
import com.payments.dto.BulkUserImportDto;
import com.payments.dto.UserRoleAssignmentDto;
import com.payments.model.Role;
import com.payments.model.User;
import com.payments.repository.RoleRepository;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map; // Import Map for the new endpoint
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN','SUPER_ADMIN')")
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepository;

    @Autowired
    public UserController(UserService userService, RoleRepository roleRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/statistics")
    public ResponseEntity<UserStatisticsDto> getUserStatistics(@RequestParam(required = false) Long institutionId) {
        Long targetInstitutionId = getTargetInstitutionId(institutionId);
        if (targetInstitutionId == null) {
            // A Super Admin viewing "All Institutions" could get global stats here if desired
            return ResponseEntity.ok(new UserStatisticsDto(0L, 0L, 0L, 0L));
        }
        return ResponseEntity.ok(userService.getUserStatistics(targetInstitutionId));
    }


    @GetMapping("/monthly-stats")
    public ResponseEntity<?> getMonthlyStats(@RequestParam(required = false) Long institutionId) {
        System.out.println("DEBUG: /api/users/monthly-stats was called.");
        Long targetInstitutionId = getTargetInstitutionId(institutionId);

        if (targetInstitutionId == null) {
            return ResponseEntity.ok(new UserStatisticsDto(0L, 0L, 0L, 0L));
        }
        return ResponseEntity.ok(userService.getUserStatistics(targetInstitutionId));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) Long institutionId) {
        Long targetInstitutionId = getTargetInstitutionId(institutionId);
        if (targetInstitutionId == null) {
            // Super Admin with "All Institutions" selected gets a global list
            return ResponseEntity.ok(userService.getAllUsersGlobally());
        }
        return ResponseEntity.ok(userService.getAllUsersInInstitution(targetInstitutionId));
    }

    private Long getTargetInstitutionId(Long requestedInstitutionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            return requestedInstitutionId; // A Super Admin can request any institution, or null for all
        } else {
            // A normal Admin can ONLY see their own institution.
            String currentUsername = authentication.getName();
            User currentUser = userService.getUserByUsername(currentUsername)
                    .orElseThrow(() -> new IllegalStateException("Current user not found."));
            return currentUser.getInstitution().getId();
        }
    }

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

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles(@RequestParam(required = false) Long institutionId) {
        if (institutionId != null) {
            return ResponseEntity.ok(roleRepository.findAllByInstitutionId(institutionId));
        }
        // Fallback for old behavior, but ideally should be secured
        return ResponseEntity.ok(userService.getAllRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody String roleName, @RequestParam Long institutionId) {
        Role createdRole = userService.createRole(roleName, institutionId);
        return ResponseEntity.ok(createdRole);
    }
}
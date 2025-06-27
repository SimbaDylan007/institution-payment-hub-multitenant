package com.payments.controller;

import com.payments.dto.UserStatisticsDto;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") // Or "/api/admin/users"
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<UserStatisticsDto> getUserStatistics() {
        return ResponseEntity.ok(userService.getUserStatistics());
    }

    // Other endpoints for Add User, Manage Roles etc. would go here
    // e.g., @PostMapping, @PutMapping("/{userId}/roles")
    // These would typically be more granular and not part of a general "settings save"
}
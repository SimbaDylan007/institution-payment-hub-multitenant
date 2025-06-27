
package com.payments.controller;

import com.payments.model.User;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        try {
            Optional<User> userOpt = userService.authenticateUser(username, password);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (!user.isEnabled()) {
                    return ResponseEntity.badRequest().body("User account is disabled");
                }
                
                // Return user info (excluding password)
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("enabled", user.isEnabled());
                response.put("roles", user.getRoles());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid username or password");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Authentication failed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> userData) {
        try {
            String username = (String) userData.get("username");
            String password = (String) userData.get("password");
            String email = (String) userData.get("email");
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body("Username and password are required");
            }

            // Check if user already exists
            if (userService.getUserByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            User newUser = userService.registerUser(username, password, email);
            
            // Return user info (excluding password)
            Map<String, Object> response = new HashMap<>();
            response.put("id", newUser.getId());
            response.put("username", newUser.getUsername());
            response.put("enabled", newUser.isEnabled());
            response.put("roles", newUser.getRoles());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed");
        }
    }
}

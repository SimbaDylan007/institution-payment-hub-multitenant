package com.payments.controller;

import com.payments.config.JwtUtil;
import com.payments.dto.JwtRequest;
import com.payments.model.User;
import com.payments.repository.UserRepository; // 1. ADD THIS IMPORT
import com.payments.dto.UserCreationDto;
import com.payments.service.CustomUserDetailsService;
import com.payments.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Be more specific in production
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    // 2. INJECT THE USER REPOSITORY
    @Autowired
    private UserRepository userRepository;

    /**
     * Authenticates a user and returns a JWT token upon success.
     * This is the primary login endpoint for the JWT system.
     *
     * @param authRequest The request body containing username and password.
     * @return A JWT token in the response.
     */
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody JwtRequest authRequest) {
        // Step 1: Authenticate the user. If this fails, it will throw an exception.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (DisabledException e) {
            return new ResponseEntity<>("USER_DISABLED", HttpStatus.UNAUTHORIZED);
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED);
        }

        // Step 2: If authentication is successful, load the UserDetails again to be safe.
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

        // Step 3: Generate the JWT token.
        final String token = jwtUtil.generateToken(userDetails);

        // Step 4: Get the full User object to return to the frontend.

        User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database. This should not happen."));

        // Step 5: Build and return the successful response.
        Map<String, Object> response = new HashMap<>();
        // The frontend code expects the key "jwttoken"
        response.put("jwttoken", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    /**
     * Registers a new user in the system.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserCreationDto registrationDto) {
        try {
            if (registrationDto.getInstitutionId() == null) {
                return ResponseEntity.badRequest().body("Institution ID is required for registration.");
            }

            if (userService.getUserByUsername(registrationDto.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
            }

            User newUser = userService.registerUser(
                    registrationDto.getUsername(),
                    registrationDto.getPassword(),
                    registrationDto.getEmail(),
                    registrationDto.getInstitutionId()
            );

            // Return a clean representation of the new user
            Map<String, Object> response = new HashMap<>();
            response.put("id", newUser.getId());
            response.put("username", newUser.getUsername());
            response.put("email", newUser.getEmail());
            response.put("roles", newUser.getRoles());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed due to an internal error.");
        }
    }
}
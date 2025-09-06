package com.payments.service;

import com.payments.model.User;
import com.payments.repository.UserRepository;
import org.slf4j.Logger; // <-- Import Logger
import org.slf4j.LoggerFactory; // <-- Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    // --- ADDED: Set up a logger for this class ---
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to authenticate user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("Authentication failed: User '{}' not found in the database.", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        logger.info("User '{}' found. Password hash: {}", user.getUsername(), user.getPassword());

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            logger.error("Authentication failed: User '{}' has no roles assigned.", username);
            throw new UsernameNotFoundException("User has no roles assigned: " + username);
        }

        logger.info("User '{}' has roles: {}", user.getUsername(), user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList()));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toSet())
        );
    }
}
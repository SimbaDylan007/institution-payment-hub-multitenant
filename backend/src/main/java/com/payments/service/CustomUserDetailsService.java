package com.payments.service;

import com.payments.config.CustomUserDetails;
import com.payments.model.User;
import com.payments.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to load user by username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("Authentication failed: User '{}' not found.", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            logger.error("Authentication failed: User '{}' has no assigned roles.", username);
            throw new UsernameNotFoundException("User has no roles: " + username);
        }

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        logger.info("Successfully loaded user '{}' with roles: {}", username, authorities);


        return new CustomUserDetails(user, authorities);
    }
}
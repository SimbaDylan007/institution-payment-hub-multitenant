package com.payments.model;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users") // Or your existing user table name
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password; // Should be hashed
    private boolean enabled; // For active/inactive status

    // Example: Many-to-Many with Roles
    @ManyToMany(fetch = FetchType.EAGER) // Eager fetch for simplicity in stats; consider LAZY for performance
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();


    // Example: Single Role as a String (simpler alternative if users have only one role)
    // private String role; // e.g., "ADMIN", "TEACHER"

    public User() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    // Helper to add role
    public void addRole(Role role) {
        this.roles.add(role);
    }
}
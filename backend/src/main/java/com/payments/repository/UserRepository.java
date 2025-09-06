package com.payments.repository;

import com.payments.model.Role;
import com.payments.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    List<User> findByRoles_Name(String roleName);

    List<User> findByEmailIn(List<String> emails);

    /**
     * Counts users based on their enabled status.
     * @param isEnabled true for active users, false for inactive.
     * @return The count of users with the specified status.
     */
    long countByEnabled(boolean isEnabled);

    /**
     * Counts users that have a specific role assigned to them.
     * @param role The Role entity to search for.
     * @return The count of users containing that role.
     */
    long countByRolesContaining(Role role);
}
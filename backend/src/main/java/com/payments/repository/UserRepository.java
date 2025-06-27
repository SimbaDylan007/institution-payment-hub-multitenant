
package com.payments.repository;

import com.payments.model.User;
import com.payments.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    long countByEnabled(boolean enabled);
    long countByRolesContaining(Role role);
    Optional<User> findByUsername(String username);
    // If using Set<Role> roles in User
    // If using String role in User:
    // long countByRole(String roleName);
}

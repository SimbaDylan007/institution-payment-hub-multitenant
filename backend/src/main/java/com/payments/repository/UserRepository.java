package com.payments.repository;

import com.payments.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    long countByInstitutionId(Long institutionId);

    long countByInstitutionIdAndEnabled(Long institutionId, boolean enabled);

    long countByInstitutionIdAndRolesContaining(Long institutionId, Role role);

    List<User> findAllByInstitutionId(Long institutionId);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndInstitution(String username, Institution institution);

    List<User> findByRoles_Name(String roleName);

    List<User> findByEmailIn(List<String> emails);

    List<User> findByInstitution(Institution institution);

    List<User> findByRoles_NameAndInstitution(String roleName, Institution institution);

    long countByEnabled(boolean isEnabled);

    long countByRolesContaining(Role role);

    boolean existsByInstitutionId(Long institutionId);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
    long countUsersByRoleName(@Param("roleName") String roleName);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.institution.id = :institutionId")
    long countUsersByRoleNameAndInstitutionId(@Param("roleName") String roleName, @Param("institutionId") Long institutionId);

}
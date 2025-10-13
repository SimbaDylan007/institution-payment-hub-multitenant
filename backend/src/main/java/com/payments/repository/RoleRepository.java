package com.payments.repository;

import com.payments.model.Institution;
import com.payments.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {


    List<Role> findByName(String name);

    Optional<Role> findByNameAndInstitution(String name, Institution institution);

    List<Role> findAllByInstitutionId(Long institutionId);

    void deleteAllByInstitutionId(Long institutionId);

}
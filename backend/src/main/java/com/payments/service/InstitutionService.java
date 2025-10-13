package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.payments.dto.InstitutionDto;
import java.util.List;
import javax.persistence.EntityNotFoundException;
import java.util.Arrays;


@Service
public class InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private StudentCategoryRepository studentCategoryRepository;


    /**
     * Retrieves a list of all institutions in the system.
     */
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    /**
     * Creates a new institution.
     * @param institution The institution object to be saved.
     * @return The saved Institution entity with its new ID.
     */

    @Transactional
    public Institution createInstitution(InstitutionDto dto) {
        if (institutionRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("An institution with the name '" + dto.getName() + "' already exists.");
        }

        Institution institution = new Institution();
        institution.setName(dto.getName());
        institution.setAddress(dto.getAddress());
        institution.setSchoolEmail(dto.getSchoolEmail());
        Institution savedInstitution = institutionRepository.save(institution);

        // Auto-create default roles for the new institution
        List<String> defaultRoleNames = Arrays.asList("ROLE_ADMIN", "ROLE_IT_ADMIN", "ROLE_FINANCE_ADMIN", "ROLE_ADMINISTRATOR", "ROLE_TEACHER", "ROLE_STUDENT");
        for (String roleName : defaultRoleNames) {
            Role newRole = new Role(roleName);
            newRole.setInstitution(savedInstitution);
            roleRepository.save(newRole);
        }

        // Auto-create a default student category for the new institution
        StudentCategory defaultCategory = new StudentCategory();
        defaultCategory.setName("OTHER"); // The required default category
        defaultCategory.setInstitution(savedInstitution); // Link it to the new institution
        studentCategoryRepository.save(defaultCategory);

        return savedInstitution;
    }

    /**
     * Updates an existing institution's details.
     * @param id The ID of the institution to update.
     * @param institutionDetails An Institution object containing the new details.
     * @return The updated Institution entity.
     */
    @Transactional
    public Institution updateInstitution(Long id, InstitutionDto dto) {
        Institution existingInstitution = institutionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found with id: " + id));

        existingInstitution.setName(dto.getName());
        existingInstitution.setAddress(dto.getAddress());
        existingInstitution.setSchoolEmail(dto.getSchoolEmail());

        return institutionRepository.save(existingInstitution);
    }

    /**
     * Deletes an institution.
     * Includes safety checks to prevent deletion if the institution is in use.
     * @param id The ID of the institution to delete.
     */
    @Transactional
    public void deleteInstitution(Long id) {
        if (!institutionRepository.existsById(id)) {
            throw new EntityNotFoundException("Institution not found with id: " + id);
        }

        // You'll need to add `countByInstitutionId` to your UserRepository for this to work
        if (userRepository.countByInstitutionId(id) > 0) {
            throw new IllegalStateException("Cannot delete institution: It has users assigned to it.");
        }

        // Check for associated staff members.
        if (staffRepository.countByInstitutionId(id) > 0) {
            throw new IllegalStateException("Cannot delete institution: It has staff members assigned to it.");
        }

        // You'll need to add `countByInstitutionId` to your StudentRepository
        if (studentRepository.countByInstitutionId(id) > 0) {
            throw new IllegalStateException("Cannot delete institution: It has students enrolled.");
        }

        // before deleting the institution itself, to avoid a foreign key constraint violation.
        roleRepository.deleteAllByInstitutionId(id);

        // Finally, delete the institution.
        institutionRepository.deleteById(id);
    }
}
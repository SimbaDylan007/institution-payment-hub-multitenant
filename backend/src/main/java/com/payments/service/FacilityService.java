package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.hibernate.Session;
import org.springframework.security.core.Authentication;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;
    @Autowired
    private UserRepository userRepository;
    @PersistenceContext
    private EntityManager entityManager;

    // UPDATED: This method now handles all filtering and pagination
    public Page<Facility> getAllFacilities(String status, String type, String searchTerm, Pageable pageable, Long institutionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return facilityRepository.findByInstitutionIdWithFilters(institutionId, status, type, searchTerm, pageable);
        }

        // For regular users, the automatic filter on findWithFilters is sufficient
        String statusFilter = (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) ? status : null;
        String typeFilter = (type != null && !type.isEmpty() && !type.equalsIgnoreCase("ALL")) ? type : null;
        String searchFilter = (searchTerm != null && !searchTerm.isEmpty()) ? searchTerm : null;
        return facilityRepository.findWithFilters(statusFilter, typeFilter, searchFilter, pageable);
    }

    public Optional<Facility> getFacilityById(Long id) {
        return facilityRepository.findById(id);
    }

    @Transactional
    public Facility createFacility(Facility facility) {
        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null && !isSuperAdmin(currentUser)) throw new IllegalStateException("User must belong to an institution.");

        facility.setInstitution(institution);

        if (facility.getStatus() == null || facility.getStatus().isEmpty()) {
            facility.setStatus("AVAILABLE");
        }
        return facilityRepository.save(facility);
    }

    @Transactional
    public Facility updateFacility(Long id, Facility facilityDetails) {
        return facilityRepository.findById(id).map(facility -> {
            facility.setName(facilityDetails.getName());
            facility.setDescription(facilityDetails.getDescription());
            facility.setType(facilityDetails.getType());
            facility.setCapacity(facilityDetails.getCapacity());
            facility.setLocation(facilityDetails.getLocation());
            facility.setStatus(facilityDetails.getStatus());
            facility.setEquipment(facilityDetails.getEquipment());
            return facilityRepository.save(facility);
        }).orElse(null);
    }

    @Transactional
    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }
}
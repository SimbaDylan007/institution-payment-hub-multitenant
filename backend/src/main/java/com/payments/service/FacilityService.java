package com.payments.service;

import com.payments.model.Facility;
import com.payments.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    // UPDATED: This method now handles all filtering and pagination
    public Page<Facility> getAllFacilities(String status, String type, String searchTerm, Pageable pageable) {
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
}
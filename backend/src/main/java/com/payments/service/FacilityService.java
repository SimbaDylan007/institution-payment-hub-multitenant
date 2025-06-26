
package com.payments.service;

import com.payments.model.Facility;
import com.payments.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FacilityService {
    
    @Autowired
    private FacilityRepository facilityRepository;
    
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }
    
    public Optional<Facility> getFacilityById(Long id) {
        return facilityRepository.findById(id);
    }
    
    public List<Facility> getFacilitiesByType(String type) {
        return facilityRepository.findByType(type);
    }
    
    public List<Facility> getFacilitiesByStatus(String status) {
        return facilityRepository.findByStatus(status);
    }
    
    public List<Facility> getAvailableFacilities() {
        return facilityRepository.findByStatus("AVAILABLE");
    }
    
    @Transactional
    public Facility createFacility(Facility facility) {
        if (facility.getStatus() == null) {
            facility.setStatus("AVAILABLE");
        }
        return facilityRepository.save(facility);
    }
    
    @Transactional
    public Facility updateFacility(Long id, Facility facilityDetails) {
        Optional<Facility> optionalFacility = facilityRepository.findById(id);
        if (optionalFacility.isPresent()) {
            Facility facility = optionalFacility.get();
            facility.setName(facilityDetails.getName());
            facility.setDescription(facilityDetails.getDescription());
            facility.setType(facilityDetails.getType());
            facility.setCapacity(facilityDetails.getCapacity());
            facility.setLocation(facilityDetails.getLocation());
            facility.setStatus(facilityDetails.getStatus());
            facility.setEquipment(facilityDetails.getEquipment());
            return facilityRepository.save(facility);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteFacility(Long id) {
        if (facilityRepository.existsById(id)) {
            facilityRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

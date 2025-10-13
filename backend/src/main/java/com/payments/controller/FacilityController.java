package com.payments.controller;

import com.payments.model.Facility;
import com.payments.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
// Updated security to include SUPER_ADMIN
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN')")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping
    public ResponseEntity<Page<Facility>> getAllFacilities(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false, defaultValue = "") String searchTerm,
            @RequestParam(required = false) Long institutionId, // <-- Accept optional institutionId
            Pageable pageable) {
        // Pass institutionId to the service method
        Page<Facility> facilities = facilityService.getAllFacilities(status, type, searchTerm, pageable, institutionId);
        return ResponseEntity.ok(facilities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable Long id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Facility> createFacility(@RequestBody Facility facility) {
        Facility createdFacility = facilityService.createFacility(facility);
        return ResponseEntity.ok(createdFacility);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateFacility(@PathVariable Long id, @RequestBody Facility facility) {
        // The update method in the service is already secure via the filtered findById
        Facility updatedFacility = facilityService.updateFacility(id, facility);
        return updatedFacility != null ? ResponseEntity.ok(updatedFacility) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        try {
            // The delete method in the service is already secure via the filtered findById
            facilityService.deleteFacility(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Can be more specific here, but notFound is a safe default
            return ResponseEntity.notFound().build();
        }
    }

}
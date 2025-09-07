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
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR')")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    // UPDATED: This is now the primary endpoint for getting facilities
    @GetMapping
    public ResponseEntity<Page<Facility>> getAllFacilities(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false, defaultValue = "") String searchTerm,
            Pageable pageable) {
        Page<Facility> facilities = facilityService.getAllFacilities(status, type, searchTerm, pageable);
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
        Facility updatedFacility = facilityService.updateFacility(id, facility);
        return updatedFacility != null ? ResponseEntity.ok(updatedFacility) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

package com.payments.controller;

import com.payments.model.Facility;
import com.payments.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
public class FacilityController {
    
    @Autowired
    private FacilityService facilityService;
    
    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities() {
        List<Facility> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(facilities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable Long id) {
        Optional<Facility> facility = facilityService.getFacilityById(id);
        return facility.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Facility>> getFacilitiesByType(@PathVariable String type) {
        List<Facility> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(facilities);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Facility>> getFacilitiesByStatus(@PathVariable String status) {
        List<Facility> facilities = facilityService.getFacilitiesByStatus(status);
        return ResponseEntity.ok(facilities);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Facility>> getAvailableFacilities() {
        List<Facility> facilities = facilityService.getAvailableFacilities();
        return ResponseEntity.ok(facilities);
    }
    
    @PostMapping
    public ResponseEntity<Facility> createFacility(@RequestBody Facility facility) {
        Facility createdFacility = facilityService.createFacility(facility);
        return ResponseEntity.ok(createdFacility);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateFacility(@PathVariable Long id, @RequestBody Facility facility) {
        Facility updatedFacility = facilityService.updateFacility(id, facility);
        if (updatedFacility != null) {
            return ResponseEntity.ok(updatedFacility);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        boolean deleted = facilityService.deleteFacility(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

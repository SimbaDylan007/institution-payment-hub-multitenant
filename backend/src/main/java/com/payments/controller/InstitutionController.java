package com.payments.controller;

import com.payments.model.Institution;
import com.payments.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.payments.dto.InstitutionDto;
import javax.persistence.EntityNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
// CRITICAL: This annotation secures all endpoints in this controller.
// Only users with the role 'ROLE_SUPER_ADMIN' will be able to access them.
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class InstitutionController {

    @Autowired
    private InstitutionService institutionService;

    /**
     * GET /api/institutions : Get a list of all institutions.
     */
    @GetMapping
    public ResponseEntity<List<Institution>> getAllInstitutions() {
        List<Institution> institutions = institutionService.getAllInstitutions();
        return ResponseEntity.ok(institutions);
    }

    /**
     * POST /api/institutions : Create a new institution.
     */
    @PostMapping
    public ResponseEntity<Institution> createInstitution(@RequestBody InstitutionDto dto) {
        Institution createdInstitution = institutionService.createInstitution(dto);
        return new ResponseEntity<>(createdInstitution, HttpStatus.CREATED);
    }

    /**
     * PUT /api/institutions/{id} : Update an existing institution.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Institution> updateInstitution(@PathVariable Long id, @RequestBody InstitutionDto dto) {
        try {
            Institution updatedInstitution = institutionService.updateInstitution(id, dto);
            return ResponseEntity.ok(updatedInstitution);
        } catch (EntityNotFoundException e) { // Catch the more specific exception
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/institutions/{id} : Delete an institution.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        try {
            institutionService.deleteInstitution(id);
            return ResponseEntity.noContent().build(); // 204 No Content is standard for successful deletion
        } catch (IllegalStateException e) {
            // This happens if the safety checks fail (institution is in use)
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict is appropriate
        } catch (RuntimeException e) {
            // This happens if the institution was not found
            return ResponseEntity.notFound().build();
        }
    }
}
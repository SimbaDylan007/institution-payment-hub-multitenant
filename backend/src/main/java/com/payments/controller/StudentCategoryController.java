// src/main/java/com/payments/controller/StudentCategoryController.java
package com.payments.controller;

import com.payments.model.StudentCategory;
import com.payments.service.StudentCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student-categories")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class StudentCategoryController {

    @Autowired private StudentCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<StudentCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<StudentCategory> createCategory(@RequestBody StudentCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
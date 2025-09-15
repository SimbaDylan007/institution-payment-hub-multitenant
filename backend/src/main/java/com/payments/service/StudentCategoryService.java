// src/main/java/com/payments/service/StudentCategoryService.java
package com.payments.service;

import com.payments.model.StudentCategory;
import com.payments.repository.StudentCategoryRepository;
import com.payments.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentCategoryService {

    @Autowired private StudentCategoryRepository categoryRepository;
    @Autowired private StudentRepository studentRepository;

    public List<StudentCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public StudentCategory createCategory(StudentCategory category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        // Safety check: prevent deleting a category that is in use
        if (studentRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("Cannot delete category: it is currently assigned to one or more students.");
        }
        categoryRepository.deleteById(id);
    }
}
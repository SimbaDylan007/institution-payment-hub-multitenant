package com.payments.service;

import com.payments.model.Institution;
import com.payments.model.StudentCategory;
import com.payments.model.User;
import com.payments.repository.StudentCategoryRepository;
import com.payments.repository.StudentRepository;
import com.payments.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import org.hibernate.Session;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import com.payments.config.GlobalDataAccess;
import org.springframework.stereotype.Service;


@Service
@GlobalDataAccess
public class StudentCategoryService {

    @Autowired private StudentCategoryRepository categoryRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;


    public List<StudentCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public StudentCategory createCategory(StudentCategory category) {
        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null) throw new IllegalStateException("You must belong to an institution.");

        // Prevent duplicate category names within the same institution
        if (categoryRepository.existsByInstitutionAndName(institution, category.getName())) {
            throw new IllegalStateException("Category with this name already exists in your institution.");
        }

        category.setInstitution(institution); // <-- STAMP INSTITUTION
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        // findById is automatically filtered
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found.");
        }
        // existsByCategoryId is also automatically filtered
        if (studentRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("Cannot delete category: it is assigned to one or more students.");
        }
        categoryRepository.deleteById(id);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("User not found."));
    }
}
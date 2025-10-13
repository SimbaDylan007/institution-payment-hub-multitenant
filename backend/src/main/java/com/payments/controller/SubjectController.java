package com.payments.controller;

import com.payments.model.Subject;
import com.payments.repository.SubjectRepository; // Assuming you have this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR', 'TEACHER','SUPER_ADMIN')")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
}
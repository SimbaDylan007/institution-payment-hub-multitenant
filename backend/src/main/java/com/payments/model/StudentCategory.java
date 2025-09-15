// src/main/java/com/payments/model/StudentCategory.java
package com.payments.model;

import javax.persistence.*;

@Entity
@Table(name = "student_categories")
public class StudentCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // Constructors
    public StudentCategory() {}
    public StudentCategory(String name) { this.name = name; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
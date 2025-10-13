// src/main/java/com/payments/model/Student.java
package com.payments.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.time.Year;
import java.util.Random;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Table(name = "students")
@FilterDef(name = "institutionFilter", parameters = @ParamDef(name = "institutionId", type = "long"))
@Filter(name = "institutionFilter", condition = "institution_id = :institutionId")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String gender;

    private String address;

    @Column(nullable = false)
    private String enrollmentStatus;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate enrollmentDate;

    private String currentGrade;

    private String section;

    // --- THIS IS THE FULLY CORRECTED FIELD DEFINITION ---
    @ManyToOne(fetch = FetchType.EAGER) // Eager fetch is often useful for display purposes
    @JoinColumn(name = "category_id", nullable = false)
    private StudentCategory category;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;


    @JsonManagedReference
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guardian> guardians;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AcademicRecord> academicRecords;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;

    @PrePersist
    public void generateStudentId() {
        if (this.studentId == null) {
            String year = String.valueOf(Year.now().getValue()).substring(2);
            int randomNum = new Random().nextInt(90000) + 10000;
            this.studentId = "P" + year + randomNum;
        }
    }


    public Student() {}

    // Getters and Setters (no changes needed here)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEnrollmentStatus() { return enrollmentStatus; }
    public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public String getCurrentGrade() { return currentGrade; }
    public void setCurrentGrade(String currentGrade) { this.currentGrade = currentGrade; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public StudentCategory getCategory() { return category; }
    public void setCategory(StudentCategory category) { this.category = category; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Guardian> getGuardians() { return guardians; }
    public void setGuardians(List<Guardian> guardians) { this.guardians = guardians; }
    public List<MedicalRecord> getMedicalRecords() { return medicalRecords; }
    public void setMedicalRecords(List<MedicalRecord> medicalRecords) { this.medicalRecords = medicalRecords; }
    public List<AcademicRecord> getAcademicRecords() { return academicRecords; }
    public void setAcademicRecords(List<AcademicRecord> academicRecords) { this.academicRecords = academicRecords; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}
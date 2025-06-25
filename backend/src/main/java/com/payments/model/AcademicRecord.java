
package com.payments.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "academic_records")
public class AcademicRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private String semester;
    
    @Column(nullable = false)
    private String subject;
    
    private Double grade;
    
    private String letterGrade;
    
    private Double attendancePercentage;
    
    @Column(nullable = false)
    private LocalDate recordDate;
    
    private String examType; // MIDTERM, FINAL, ASSIGNMENT, QUIZ
    
    private String comments;
    
    // Constructors
    public AcademicRecord() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }
    
    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
    
    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    
    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}

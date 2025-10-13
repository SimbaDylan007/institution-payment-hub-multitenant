
package com.payments.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exams")
public class Exam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;
    
    @Column(nullable = false)
    private LocalDate examDate;
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    @Column(nullable = false)
    private String grade;
    
    private String venue;
    
    private String instructions;
    
    private Integer maxMarks;
    
    private String examType; // MIDTERM, FINAL, QUIZ, ASSIGNMENT
    
    private String status; // SCHEDULED, ONGOING, COMPLETED, CANCELLED
    
    // Constructors
    public Exam() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public Integer getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}


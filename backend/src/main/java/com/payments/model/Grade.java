
package com.payments.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "grades")
public class Grade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id",referencedColumnName = "id", nullable = false)
    private Institution institution;
    
    @Column(nullable = false)
    private String assessmentType; // EXAM, ASSIGNMENT, QUIZ, PROJECT
    
    @Column(nullable = false)
    private BigDecimal marksObtained;
    
    @Column(nullable = false)
    private BigDecimal maxMarks;
    
    @Column(nullable = false)
    private String letterGrade; // A+, A, B+, B, C+, C, D, F
    
    private BigDecimal gpa;
    
    @Column(nullable = false)
    private LocalDate recordedDate;
    
    private String comments;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private String semester;
    
    // Constructors
    public Grade() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    
    public BigDecimal getMarksObtained() { return marksObtained; }
    public void setMarksObtained(BigDecimal marksObtained) { this.marksObtained = marksObtained; }
    
    public BigDecimal getMaxMarks() { return maxMarks; }
    public void setMaxMarks(BigDecimal maxMarks) { this.maxMarks = maxMarks; }
    
    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
    
    public BigDecimal getGpa() { return gpa; }
    public void setGpa(BigDecimal gpa) { this.gpa = gpa; }
    
    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }

}

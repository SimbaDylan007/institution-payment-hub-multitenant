
package com.payments.model;

import javax.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "timetables")
public class Timetable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String subject; // Changed from Subject entity to String
    
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = false)
    private Institution institution;
    
    @Column(nullable = false)
    private String grade;
    
    @Column(nullable = false)
    private String section;
    
    @Column(nullable = false)
    private String dayOfWeek;
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    private String room;
    
    @Column(nullable = false)
    private String academicYear;
    
    // Constructors
    public Timetable() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}

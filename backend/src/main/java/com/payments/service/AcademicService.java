
package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicService {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private TimetableRepository timetableRepository;
    
    @Autowired
    private GradeRepository gradeRepository;
    
    @Autowired
    private ExamRepository examRepository;
    
    // Subject management
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
    
    public List<Subject> getSubjectsByGrade(String grade) {
        return subjectRepository.findByGrade(grade);
    }
    
    @Transactional
    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }
    
    @Transactional
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Optional<Subject> optionalSubject = subjectRepository.findById(id);
        if (optionalSubject.isPresent()) {
            Subject subject = optionalSubject.get();
            subject.setName(subjectDetails.getName());
            subject.setCode(subjectDetails.getCode());
            subject.setDescription(subjectDetails.getDescription());
            subject.setGrade(subjectDetails.getGrade());
            subject.setCredits(subjectDetails.getCredits());
            subject.setIsActive(subjectDetails.getIsActive());
            return subjectRepository.save(subject);
        }
        return null;
    }
    
    // Timetable management
    public List<Timetable> getTimetableByClass(String grade, String section) {
        return timetableRepository.findByGradeAndSection(grade, section);
    }
    
    public List<Timetable> getTimetableByTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }
    
    @Transactional
    public Timetable createTimetableEntry(Timetable timetable) {
        return timetableRepository.save(timetable);
    }
    
    // Grade management
    public List<Grade> getStudentGrades(Long studentId) {
        return gradeRepository.findByStudentId(studentId);
    }
    
    public List<Grade> getStudentGradesByYear(Long studentId, String academicYear) {
        return gradeRepository.findByStudentIdAndAcademicYear(studentId, academicYear);
    }
    
    @Transactional
    public Grade addGrade(Grade grade) {
        // Calculate letter grade based on score
        double percentage = (grade.getScore() / grade.getMaxScore()) * 100;
        grade.setLetterGrade(calculateLetterGrade(percentage));
        return gradeRepository.save(grade);
    }
    
    private String calculateLetterGrade(double percentage) {
        if (percentage >= 90) return "A+";
        else if (percentage >= 80) return "A";
        else if (percentage >= 70) return "B";
        else if (percentage >= 60) return "C";
        else if (percentage >= 50) return "D";
        else return "F";
    }
    
    // Exam management
    public List<Exam> getExamsByClass(String grade, String section) {
        return examRepository.findByGradeAndSection(grade, section);
    }
    
    public List<Exam> getUpcomingExams() {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        return examRepository.findByExamDateBetween(today, nextWeek);
    }
    
    @Transactional
    public Exam scheduleExam(Exam exam) {
        return examRepository.save(exam);
    }
    
    @Transactional
    public Exam updateExamStatus(Long examId, String status) {
        Optional<Exam> optionalExam = examRepository.findById(examId);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            exam.setStatus(status);
            return examRepository.save(exam);
        }
        return null;
    }
}


package com.payments.service;

import com.payments.model.Exam;
import com.payments.model.Grade;
import com.payments.model.Subject;
import com.payments.repository.ExamRepository;
import com.payments.repository.GradeRepository;
import com.payments.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicService {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private ExamRepository examRepository;
    
    @Autowired
    private GradeRepository gradeRepository;
    
    // Subject management
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
    
    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }
    
    public List<Subject> getSubjectsByGrade(String grade) {
        return subjectRepository.findByGrade(grade);
    }
    
    public List<Subject> getActiveSubjects() {
        return subjectRepository.findByIsActiveTrue();
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
            subject.setCredits(subjectDetails.getCredits());
            subject.setIsActive(subjectDetails.getIsActive());
            return subjectRepository.save(subject);
        }
        return null;
    }
    
    // Exam management
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }
    
    public List<Exam> getExamsByGrade(String grade) {
        return examRepository.findByGrade(grade);
    }
    
    public List<Exam> getUpcomingExams() {
        return examRepository.findByExamDateBetween(LocalDate.now(), LocalDate.now().plusDays(30));
    }
    
    @Transactional
    public Exam createExam(Exam exam) {
        exam.setStatus("SCHEDULED");
        return examRepository.save(exam);
    }
    
    @Transactional
    public Exam updateExam(Long id, Exam examDetails) {
        Optional<Exam> optionalExam = examRepository.findById(id);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            exam.setTitle(examDetails.getTitle());
            exam.setExamDate(examDetails.getExamDate());
            exam.setStartTime(examDetails.getStartTime());
            exam.setEndTime(examDetails.getEndTime());
            exam.setVenue(examDetails.getVenue());
            exam.setMaxMarks(examDetails.getMaxMarks());
            exam.setStatus(examDetails.getStatus());
            return examRepository.save(exam);
        }
        return null;
    }
    
    // Grade management
    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }
    
    public List<Grade> getGradesByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId);
    }
    
    public List<Grade> getGradesByStudentAndYear(Long studentId, String academicYear) {
        return gradeRepository.findByStudentIdAndAcademicYear(studentId, academicYear);
    }
    
    public BigDecimal getStudentGPA(Long studentId, String academicYear) {
        return gradeRepository.getAverageGPAByStudentAndYear(studentId, academicYear);
    }
    
    @Transactional
    public Grade createGrade(Grade grade) {
        grade.setRecordedDate(LocalDate.now());
        return gradeRepository.save(grade);
    }
    
    @Transactional
    public Grade updateGrade(Long id, Grade gradeDetails) {
        Optional<Grade> optionalGrade = gradeRepository.findById(id);
        if (optionalGrade.isPresent()) {
            Grade grade = optionalGrade.get();
            grade.setMarksObtained(gradeDetails.getMarksObtained());
            grade.setLetterGrade(gradeDetails.getLetterGrade());
            grade.setGpa(gradeDetails.getGpa());
            grade.setComments(gradeDetails.getComments());
            return gradeRepository.save(grade);
        }
        return null;
    }
}

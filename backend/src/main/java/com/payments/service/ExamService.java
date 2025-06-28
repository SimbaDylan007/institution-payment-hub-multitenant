
package com.payments.service;

import com.payments.model.Exam;
import com.payments.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExamService {
    
    @Autowired
    private ExamRepository examRepository;
    
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
        return examRepository.findByExamDateBetween(LocalDate.now(), LocalDate.now().plusMonths(3));
    }
    
    @Transactional
    public Exam scheduleExam(Exam exam) {
        if (exam.getStatus() == null) {
            exam.setStatus("SCHEDULED");
        }
        return examRepository.save(exam);
    }
    
    @Transactional
    public Exam updateExam(Long id, Exam examDetails) {
        Optional<Exam> optionalExam = examRepository.findById(id);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            exam.setTitle(examDetails.getTitle());
            exam.setSubject(examDetails.getSubject());
            exam.setExamDate(examDetails.getExamDate());
            exam.setStartTime(examDetails.getStartTime());
            exam.setEndTime(examDetails.getEndTime());
            exam.setGrade(examDetails.getGrade());
            exam.setVenue(examDetails.getVenue());
            exam.setInstructions(examDetails.getInstructions());
            exam.setMaxMarks(examDetails.getMaxMarks());
            exam.setExamType(examDetails.getExamType());
            exam.setStatus(examDetails.getStatus());
            return examRepository.save(exam);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteExam(Long id) {
        if (examRepository.existsById(id)) {
            examRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

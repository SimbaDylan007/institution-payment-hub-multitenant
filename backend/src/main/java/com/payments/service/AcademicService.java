package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.GradeDTO;
import com.payments.model.Exam;
import com.payments.model.Grade;
import com.payments.model.Student;
import com.payments.model.Subject;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
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

    @Autowired
    private StudentRepository studentRepository;
    
    // Subject management
    public Page<Subject> getAllSubjects(String grade, String searchTerm, Pageable pageable) {
        return subjectRepository.findByGradeAndSearchTerm(grade, searchTerm, pageable);
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
    public Page<Grade> getAllGrades(String year, String semester, String letterGrade, String searchTerm, Pageable pageable) {
        return gradeRepository.findWithFilters(year, semester, letterGrade, searchTerm, pageable);
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
    public Grade createGrade(GradeDTO gradeDTO) {
        // Fetch the related entities from the database
        Student student = studentRepository.findByStudentId(gradeDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + gradeDTO.getStudentId()));

        // Find all subjects with that code (should be only one)
        Subject subject = subjectRepository.findByCode(gradeDTO.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with code: " + gradeDTO.getSubjectId()));



        // Create and populate the Grade entity
        Grade grade = new Grade();
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setAssessmentType(gradeDTO.getAssessmentType());
        grade.setMarksObtained(gradeDTO.getMarksObtained());
        grade.setMaxMarks(gradeDTO.getMaxMarks());
        grade.setLetterGrade(gradeDTO.getLetterGrade());
        grade.setAcademicYear(gradeDTO.getAcademicYear());
        grade.setSemester(gradeDTO.getSemester());
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

    // --- NEW: Bulk Import for Subjects ---
    @Transactional
    public List<Subject> bulkAddSubjects(MultipartFile file) throws IOException, CsvValidationException {
        List<Subject> processedSubjects = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1); // Skip header
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                String code = line[0];
                Optional<Subject> existing = subjectRepository.findByCode(code);
                Subject subject = existing.orElse(new Subject());
                subject.setCode(code);
                subject.setName(line[1]);
                subject.setGrade(line[2]);
                subject.setCredits(Integer.parseInt(line[3]));
                subject.setDescription(line[4]);
                subject.setIsActive(true);
                processedSubjects.add(subject);
            }
        }
        return subjectRepository.saveAll(processedSubjects);
    }

    // --- NEW: Bulk Import for Grades ---
    @Transactional
    public List<Grade> bulkAddGrades(MultipartFile file) throws IOException, CsvValidationException {
        List<Grade> processedGrades = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1); // Skip header
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                Optional<Student> studentOpt = studentRepository.findByStudentId(line[0]);
                Optional<Subject> subjectOpt = subjectRepository.findByCode(line[1]);
                if (studentOpt.isPresent() && subjectOpt.isPresent()) {
                    Grade grade = new Grade();
                    grade.setStudent(studentOpt.get());
                    grade.setSubject(subjectOpt.get());
                    grade.setAssessmentType(line[2]);
                    grade.setMarksObtained(new BigDecimal(line[3]));
                    grade.setMaxMarks(new BigDecimal(line[4]));
                    grade.setLetterGrade(line[5]);
                    grade.setAcademicYear(line[6]);
                    grade.setSemester(line[7]);
                    grade.setRecordedDate(LocalDate.now());
                    processedGrades.add(grade);
                }
            }
        }
        return gradeRepository.saveAll(processedGrades);
    }

    @Transactional
    public void deleteGrade(Long gradeId) {
        if (!gradeRepository.existsById(gradeId)) {
            // Or you can just let it fail silently
            throw new RuntimeException("Grade not found with id: " + gradeId);
        }
        gradeRepository.deleteById(gradeId);
    }

    @Transactional
    public void deleteSubject(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException("Subject not found with id: " + subjectId);
        }

        // CORRECTED: ADDED THE SAFETY CHECK
        // Before deleting, check if any grade records use this subject.
        if (gradeRepository.existsBySubjectId(subjectId)) {
            throw new IllegalStateException("Cannot delete this subject because it is already associated with existing grades.");
        }

        subjectRepository.deleteById(subjectId);
    }


}

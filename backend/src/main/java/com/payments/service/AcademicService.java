package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.GradeDTO;
import com.payments.model.*;
import com.payments.repository.*;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AcademicService {

    @Autowired private SubjectRepository subjectRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;

    @PersistenceContext private EntityManager entityManager;

    // --- Subject management ---
    public Page<Subject> getAllSubjects(String grade, String searchTerm, Pageable pageable, Long institutionId) {
        if (isSuperAdmin() && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return subjectRepository.findByInstitutionIdAndGradeAndSearchTerm(institutionId, grade, searchTerm, pageable);
        }
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
        User currentUser = getCurrentUser();
        if (subject.getInstitution() == null) {
            subject.setInstitution(currentUser.getInstitution());
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
        subject.setName(subjectDetails.getName());
        subject.setCode(subjectDetails.getCode());
        subject.setDescription(subjectDetails.getDescription());
        subject.setCredits(subjectDetails.getCredits());
        subject.setIsActive(subjectDetails.getIsActive());
        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException("Subject not found with id: " + subjectId);
        }
        if (gradeRepository.existsBySubjectId(subjectId)) {
            throw new IllegalStateException("Cannot delete this subject because it is already associated with existing grades.");
        }
        subjectRepository.deleteById(subjectId);
    }

    // --- Exam management ---
    public Page<Exam> getAllExams(Pageable pageable, Long institutionId) {
        if (isSuperAdmin() && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return examRepository.findByInstitutionId(institutionId, pageable);
        }
        return examRepository.findAll(pageable);
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
        User currentUser = getCurrentUser();
        exam.setInstitution(currentUser.getInstitution());
        exam.setStatus("SCHEDULED");
        return examRepository.save(exam);
    }

    @Transactional
    public Exam updateExam(Long id, Exam examDetails) {
        Exam exam = examRepository.findById(id).orElseThrow(() -> new RuntimeException("Exam not found"));
        exam.setTitle(examDetails.getTitle());
        exam.setExamDate(examDetails.getExamDate());
        exam.setStartTime(examDetails.getStartTime());
        exam.setEndTime(examDetails.getEndTime());
        exam.setVenue(examDetails.getVenue());
        exam.setMaxMarks(examDetails.getMaxMarks());
        exam.setStatus(examDetails.getStatus());
        return examRepository.save(exam);
    }

    // --- Grade management ---
    public Page<Grade> getAllGrades(String year, String semester, String letterGrade, String searchTerm, Pageable pageable, Long institutionId) {
        if (isSuperAdmin() && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
        }
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
        Student student = studentRepository.findByStudentId(gradeDTO.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findByCode(gradeDTO.getSubjectId()).orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!Objects.equals(student.getInstitution().getId(), subject.getInstitution().getId())) {
            throw new SecurityException("Cannot create a grade for a student and subject from different institutions.");
        }

        Grade grade = new Grade();
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setInstitution(student.getInstitution());
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
        Grade grade = gradeRepository.findById(id).orElseThrow(() -> new RuntimeException("Grade not found"));
        grade.setMarksObtained(gradeDetails.getMarksObtained());
        grade.setLetterGrade(gradeDetails.getLetterGrade());
        grade.setGpa(gradeDetails.getGpa());
        grade.setComments(gradeDetails.getComments());
        return gradeRepository.save(grade);
    }

    @Transactional
    public void deleteGrade(Long gradeId) {
        if (!gradeRepository.existsById(gradeId)) {
            throw new RuntimeException("Grade not found with id: " + gradeId);
        }
        gradeRepository.deleteById(gradeId);
    }

    private Institution determineTargetInstitution(User currentUser, Long institutionIdOverride) {
        if (isSuperAdmin(currentUser) && institutionIdOverride != null) {
            return entityManager.find(Institution.class, institutionIdOverride);
        }
        Institution target = currentUser.getInstitution();
        if (target == null) throw new IllegalStateException("You must belong to an institution to perform this action.");
        return target;
    }

    // --- Bulk Import ---
    @Transactional
    public List<Subject> bulkAddSubjects(MultipartFile file,  Long institutionIdOverride) throws IOException, CsvValidationException {
        User currentUser = getCurrentUser();
        Institution targetInstitution = determineTargetInstitution(currentUser, institutionIdOverride);
        if (targetInstitution == null) throw new IllegalStateException("User must belong to an institution to import subjects.");

        List<Subject> processedSubjects = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1);
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                String code = line[0];
                // Use the tenant-aware findByCodeAndInstitution method
                Optional<Subject> existing = subjectRepository.findByCodeAndInstitution(code, targetInstitution);
                Subject subject = existing.orElse(new Subject());
                subject.setInstitution(targetInstitution);
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

    @Transactional
    public List<Grade> bulkAddGrades(MultipartFile file, Long institutionIdOverride) throws IOException, CsvValidationException {
        User currentUser = getCurrentUser();
        Institution targetInstitution = determineTargetInstitution(currentUser, institutionIdOverride);
        if (targetInstitution == null) throw new IllegalStateException("User must belong to an institution to import grades.");

        List<Grade> processedGrades = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1);
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                // Use tenant-aware finders
                Optional<Student> studentOpt = studentRepository.findByStudentIdAndInstitution(line[0], targetInstitution);
                Optional<Subject> subjectOpt = subjectRepository.findByCodeAndInstitution(line[1], targetInstitution);

                if (studentOpt.isPresent() && subjectOpt.isPresent()) {
                    Grade grade = new Grade();
                    grade.setInstitution(targetInstitution);
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

    // --- Helper Methods ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("Authenticated user not found."));
    }

    private boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }
}
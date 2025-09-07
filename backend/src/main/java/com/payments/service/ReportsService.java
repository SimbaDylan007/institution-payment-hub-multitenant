package com.payments.service;

import com.payments.dto.ReportCardDto;
import com.payments.dto.StudentFinancialSummaryDto;
import com.payments.dto.SubjectGradeDto;
import com.payments.model.FinancialLedger;
import com.payments.model.Grade;
import com.payments.model.Student;
import com.payments.repository.FinancialLedgerRepository;
import com.payments.repository.GradeRepository;
import com.payments.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private FinancialLedgerRepository financialLedgerRepository;


    public List<ReportCardDto> generateStudentReportCards(String academicYear, String semester, Long studentId) {
        List<Student> studentsToProcess = new ArrayList<>();

        if (studentId != null) {
            // Generate for a single student
            studentRepository.findById(studentId).ifPresent(studentsToProcess::add);
        } else {
            // Generate for all students (can be filtered by grade level in a real scenario)
            studentsToProcess.addAll(studentRepository.findAll());
        }

        List<ReportCardDto> reportCards = new ArrayList<>();
        for (Student student : studentsToProcess) {
            reportCards.add(createReportCardForStudent(student, academicYear, semester));
        }
        return reportCards;
    }

    private ReportCardDto createReportCardForStudent(Student student, String academicYear, String semester) {
        ReportCardDto reportCard = new ReportCardDto();
        reportCard.setStudentName(student.getFirstName() + " " + student.getLastName());
        reportCard.setStudentId(student.getStudentId());
        reportCard.setGradeLevel(student.getCurrentGrade());
        reportCard.setAcademicYear(academicYear);
        reportCard.setSemester(semester);

        List<Grade> grades = gradeRepository.findByStudentIdAndAcademicYearAndSemester(student.getId(), academicYear, semester);

        // Group grades by subject to calculate final scores
        Map<String, List<Grade>> gradesBySubject = grades.stream()
                .collect(Collectors.groupingBy(grade -> grade.getSubject().getCode()));

        List<SubjectGradeDto> subjectGrades = new ArrayList<>();
        for (Map.Entry<String, List<Grade>> entry : gradesBySubject.entrySet()) {
            SubjectGradeDto subjectGrade = new SubjectGradeDto();
            subjectGrade.setSubjectCode(entry.getKey());
            subjectGrade.setSubjectName(entry.getValue().get(0).getSubject().getName());

            // Simple average calculation logic (can be made more complex)
            BigDecimal averageScore = entry.getValue().stream()
                    .map(Grade::getMarksObtained)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(entry.getValue().size()), 2, RoundingMode.HALF_UP);

            subjectGrade.setFinalScore(averageScore);
            subjectGrade.setLetterGrade(calculateLetterGrade(averageScore)); // Implement this helper
            subjectGrade.setRemarks(getRemarks(averageScore)); // Implement this helper
            subjectGrades.add(subjectGrade);
        }

        reportCard.setSubjectGrades(subjectGrades);

        // Calculate overall average
        if (!subjectGrades.isEmpty()) {
            double overallAvg = subjectGrades.stream()
                    .mapToDouble(sg -> sg.getFinalScore().doubleValue())
                    .average()
                    .orElse(0.0);
            reportCard.setOverallAverage(overallAvg);
            reportCard.setOverallGrade(calculateLetterGrade(BigDecimal.valueOf(overallAvg)));
        }

        // Placeholder comments
        reportCard.setTeacherComments("Excellent progress this semester.");
        reportCard.setPrincipalComments("A dedicated and promising student.");

        return reportCard;
    }

    // Helper methods for grading logic (customize as needed)
    private String calculateLetterGrade(BigDecimal score) {
        if (score.compareTo(new BigDecimal("90")) >= 0) return "A+";
        if (score.compareTo(new BigDecimal("80")) >= 0) return "A";
        if (score.compareTo(new BigDecimal("70")) >= 0) return "B";
        if (score.compareTo(new BigDecimal("60")) >= 0) return "C";
        if (score.compareTo(new BigDecimal("50")) >= 0) return "D";
        return "F";
    }

    private String getRemarks(BigDecimal score) {
        if (score.compareTo(new BigDecimal("80")) >= 0) return "Excellent";
        if (score.compareTo(new BigDecimal("60")) >= 0) return "Good";
        if (score.compareTo(new BigDecimal("50")) >= 0) return "Needs Improvement";
        return "Unsatisfactory";
    }

    public List<StudentFinancialSummaryDto> generateFinancialSummary(String academicYear, String semester, Long studentId, String gradeLevel) {
        List<Student> studentsToProcess;

        if (studentId != null) {
            studentsToProcess = studentRepository.findAllById(Collections.singletonList(studentId));
        } else if (gradeLevel != null && !gradeLevel.equalsIgnoreCase("ALL")) {
            studentsToProcess = studentRepository.findByCurrentGrade(gradeLevel);
        } else {
            studentsToProcess = studentRepository.findAll();
        }

        return studentsToProcess.stream()
                .map(student -> createSummaryForStudent(student, academicYear, semester))
                .collect(Collectors.toList());
    }


    private StudentFinancialSummaryDto createSummaryForStudent(Student student, String academicYear, String semester) {
        StudentFinancialSummaryDto summary = new StudentFinancialSummaryDto();
        summary.setStudentId(student.getStudentId());
        summary.setStudentName(student.getFirstName() + " " + student.getLastName());
        summary.setGradeLevel(student.getCurrentGrade());

        // --- THIS IS THE IMPROVED LOGIC ---
        // If the filter is set to a specific value, use it. Otherwise, pass null to the repository
        // so it doesn't filter by that criteria. This allows for more flexible reports.
        List<String> yearFilter = (academicYear != null && !academicYear.equalsIgnoreCase("ALL")) ? List.of(academicYear) : null;
        List<String> semesterFilter = (semester != null && !semester.equalsIgnoreCase("ALL")) ? List.of(semester) : null;

        List<FinancialLedger> periodLedger = financialLedgerRepository.findByStudentAndFilter(
                student.getId(),
                yearFilter,
                semesterFilter
        );

        BigDecimal totalCharges = periodLedger.stream()
                .filter(entry -> "DEBIT".equals(entry.getTransactionType().toString()))
                .map(FinancialLedger::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayments = periodLedger.stream()
                .filter(entry -> "CREDIT".equals(entry.getTransactionType().toString()))
                .map(FinancialLedger::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingBalance = financialLedgerRepository.getBalanceForStudent(student.getId());

        summary.setTotalCharges(totalCharges);
        summary.setTotalPayments(totalPayments);
        summary.setPeriodBalance(totalCharges.subtract(totalPayments));
        summary.setOutstandingBalance(outstandingBalance != null ? outstandingBalance : BigDecimal.ZERO);

        return summary;
    }

}
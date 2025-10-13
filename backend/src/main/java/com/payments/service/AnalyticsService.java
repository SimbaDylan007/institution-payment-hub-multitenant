package com.payments.service;

import com.payments.dto.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.payments.model.*;
import org.springframework.security.core.Authentication; // <-- IMPORT
import org.springframework.security.core.context.SecurityContextHolder; // <-- IMPORT
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class AnalyticsService {

    // --- DEPENDENCIES ---
    // Swapped FeeRepository for FinancialLedgerRepository
    private final FinancialLedgerRepository ledgerRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final StudentRepository studentRepository;
    private final ResourceUsageLogRepository resourceUsageLogRepository;

    @Autowired private UserRepository userRepository;

    @Autowired
    public AnalyticsService(FinancialLedgerRepository ledgerRepository, // <-- CORRECTED: Injects the new repository
                            AcademicRecordRepository academicRecordRepository,
                            StudentRepository studentRepository,
                            ResourceUsageLogRepository resourceUsageLogRepository) {
        this.ledgerRepository = ledgerRepository; // <-- CORRECTED
        this.academicRecordRepository = academicRecordRepository;
        this.studentRepository = studentRepository;
        this.resourceUsageLogRepository = resourceUsageLogRepository;
    }

    /**
     * Calculates financial analytics data from the Ledger repository.
     * THIS METHOD IS NOW CORRECTED.
     */
    public FinancialAnalyticsDto getFinancialAnalytics() {
        FinancialAnalyticsDto dto = new FinancialAnalyticsDto();

        // Calls methods on the new ledgerRepository
        dto.setTotalFeesCollected(ledgerRepository.findTotalFeesCollected().orElse(BigDecimal.ZERO));
        dto.setOutstandingFees(ledgerRepository.findTotalOutstandingFees().orElse(BigDecimal.ZERO));
        dto.setTotalTransactions(ledgerRepository.count());

        // Using LocalDate as expected by the new repository query
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1); // Correctly get end of current month
        dto.setMonthlyRevenue(ledgerRepository.findRevenueBetweenDates(startOfMonth, endOfMonth).orElse(BigDecimal.ZERO));

        return dto;
    }

    // --- ALL METHODS BELOW ARE UNCHANGED AND PRESERVED ---

    /**
     * Calculates student performance analytics from academic records.
     */
    public StudentPerformanceDto getStudentPerformance() {
        StudentPerformanceDto dto = new StudentPerformanceDto();
        double overallAverage = academicRecordRepository.findOverallAverageGrade().orElse(0.0);
        dto.setAverageGrade(Math.round(overallAverage * 10.0) / 10.0); // Round to one decimal
        dto.setStudentsAboveAverage((int) academicRecordRepository.countStudentsAboveAverage(overallAverage));

        // Get top student
        List<Object[]> topStudentData = academicRecordRepository.findStudentPerformance(PageRequest.of(0, 1));
        if (!topStudentData.isEmpty()) {
            Long studentId = (Long) topStudentData.get(0)[0];
            studentRepository.findById(studentId).ifPresent(student ->
                    dto.setTopPerformingStudent(student.getFirstName() + " " + student.getLastName()));
        } else {
            dto.setTopPerformingStudent("N/A");
        }

        // Get lowest performing student
        long totalStudents = studentRepository.count();
        if (totalStudents > 0) {
            List<Object[]> bottomStudentData = academicRecordRepository.findStudentPerformance(PageRequest.of((int)totalStudents - 1 , 1));
            if (!bottomStudentData.isEmpty()) {
                Long studentId = (Long) bottomStudentData.get(0)[0];
                studentRepository.findById(studentId).ifPresent(student ->
                        dto.setLowestPerformingStudent(student.getFirstName() + " " + student.getLastName()));
            }
        } else {
            dto.setLowestPerformingStudent("N/A");
        }

        return dto;
    }

    /**
     * Calculates subject-related analytics from academic records.
     */
    public SubjectAnalyticsDto getSubjectAnalytics() {
        SubjectAnalyticsDto dto = new SubjectAnalyticsDto();
        dto.setTotalSubjects((int) academicRecordRepository.countDistinctSubjects());

        List<Object[]> subjectPerformance = academicRecordRepository.findSubjectPerformance(PageRequest.of(0, 1));
        if (!subjectPerformance.isEmpty()) {
            dto.setHighestAverageSubject((String) subjectPerformance.get(0)[0]);
            dto.setLowestAverageSubject((String) subjectPerformance.get(subjectPerformance.size() - 1)[0]);
        } else {
            dto.setHighestAverageSubject("N/A");
            dto.setLowestAverageSubject("N/A");
        }
        return dto;
    }

    /**
     * Calculates class performance analytics from academic records.
     */
    public ClassPerformanceDto getClassPerformance() {
        ClassPerformanceDto dto = new ClassPerformanceDto();
        dto.setTotalClasses((int) academicRecordRepository.countDistinctSubjectsCount());

        List<Object[]> classPerformance = academicRecordRepository.findSubjectGradePerformance(PageRequest.of(0, 1));
        if (!classPerformance.isEmpty()) {
            dto.setTopPerformingClass((String) classPerformance.get(0)[0]);
            double topGrade = (Double) classPerformance.get(0)[1];
            dto.setTopClassAverageGrade(Math.round(topGrade * 10.0) / 10.0);
        } else {
            dto.setTopPerformingClass("N/A");
            dto.setTopClassAverageGrade(0.0);
        }
        return dto;
    }

    /**
     * Calculates attendance analytics from academic records.
     */
    public AttendanceAnalyticsDto getAttendanceAnalytics() {
        AttendanceAnalyticsDto dto = new AttendanceAnalyticsDto();
        double overallAttendance = academicRecordRepository.findOverallAverageAttendance().orElse(0.0);
        dto.setOverallAttendancePercentage(Math.round(overallAttendance * 10.0) / 10.0);

        List<Object[]> attendancePerformance = academicRecordRepository.findSubjectAttendancePerformance(PageRequest.of(0, 1));
        if (!attendancePerformance.isEmpty()) {
            dto.setClassWithHighestAttendance((String) attendancePerformance.get(0)[0]);
            dto.setClassWithLowestAttendance((String) attendancePerformance.get(attendancePerformance.size() - 1)[0]);
        } else {
            dto.setClassWithHighestAttendance("N/A");
            dto.setClassWithLowestAttendance("N/A");
        }
        return dto;
    }

    /**
     * Calculates resource utilization from usage logs.
     */
    public ResourceUtilizationDto getResourceUtilization() {
        ResourceUtilizationDto dto = new ResourceUtilizationDto();
        long totalUsage = resourceUsageLogRepository.count();

        if (totalUsage == 0) {
            dto.setMostUsedResource("N/A");
            dto.setLeastUsedResource("N/A");
            dto.setLibraryUtilizationPercentage(0.0);
            dto.setLabUtilizationPercentage(0.0);
            return dto;
        }

        List<Object[]> usageFrequency = resourceUsageLogRepository.findResourceUsageFrequency();
        if (!usageFrequency.isEmpty()) {
            dto.setMostUsedResource((String) usageFrequency.get(0)[0]);
            dto.setLeastUsedResource((String) usageFrequency.get(usageFrequency.size() - 1)[0]);
        } else {
            dto.setMostUsedResource("N/A");
            dto.setLeastUsedResource("N/A");
        }

        long libraryUsageCount = resourceUsageLogRepository.countByResourceName("Library");
        double libraryUtilization = (double) libraryUsageCount / totalUsage * 100.0;
        dto.setLibraryUtilizationPercentage(Math.round(libraryUtilization * 10.0) / 10.0);

        long labUsageCount = resourceUsageLogRepository.countByResourceNameLike("%Lab%");
        double labUtilization = (double) labUsageCount / totalUsage * 100.0;
        dto.setLabUtilizationPercentage(Math.round(labUtilization * 10.0) / 10.0);

        return dto;
    }
}
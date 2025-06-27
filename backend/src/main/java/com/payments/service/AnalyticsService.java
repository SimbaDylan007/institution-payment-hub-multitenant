package com.payments.service;

import com.payments.dto.*;
import com.payments.model.Student;
import com.payments.repository.AcademicRecordRepository;
import com.payments.repository.FeeRepository;
import com.payments.repository.ResourceUsageLogRepository;
import com.payments.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyticsService {

    private final FeeRepository feeRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final StudentRepository studentRepository;
    private final ResourceUsageLogRepository resourceUsageLogRepository;

    @Autowired
    public AnalyticsService(FeeRepository feeRepository,
                            AcademicRecordRepository academicRecordRepository,
                            StudentRepository studentRepository,
                            ResourceUsageLogRepository resourceUsageLogRepository) {
        this.feeRepository = feeRepository;
        this.academicRecordRepository = academicRecordRepository;
        this.studentRepository = studentRepository;
        this.resourceUsageLogRepository = resourceUsageLogRepository;
    }

    /**
     * Calculates financial analytics data from the Fee repository.
     */
    public FinancialAnalyticsDto getFinancialAnalytics() {
        FinancialAnalyticsDto dto = new FinancialAnalyticsDto();
        dto.setTotalFeesCollected(feeRepository.findTotalFeesCollected().orElse(BigDecimal.ZERO));
        dto.setOutstandingFees(feeRepository.findTotalOutstandingFees().orElse(BigDecimal.ZERO));
        dto.setTotalTransactions(feeRepository.count());

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay();
        dto.setMonthlyRevenue(feeRepository.findRevenueBetweenDates(startOfMonth, endOfMonth).orElse(BigDecimal.ZERO));

        return dto;
    }

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
        // Note: For large datasets, a separate query with ORDER BY ASC would be more efficient.
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
            // To get lowest, you could reuse the list if it's small, or run another query with ORDER BY ASC
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
        dto.setTotalClasses((int) academicRecordRepository.countDistinctSubjectsCount()); // 1. Changed this line

        List<Object[]> classPerformance = academicRecordRepository.findSubjectGradePerformance(PageRequest.of(0, 1)); // 2. Changed this line
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

        List<Object[]> attendancePerformance = academicRecordRepository.findSubjectAttendancePerformance(PageRequest.of(0, 1)); // 3. Changed this line
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
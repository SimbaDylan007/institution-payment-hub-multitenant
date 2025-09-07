package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudentPortalService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private FinancialLedgerRepository financialLedgerRepository;
    @Autowired private BookTransactionRepository bookTransactionRepository;
    @Autowired private ScheduleEventRepository scheduleEventRepository;
    @Autowired private NotificationRepository notificationRepository;

    // Helper method to get the currently authenticated user's details
    private Optional<UserDetails> getAuthenticatedUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetails)) {
            return Optional.empty();
        }
        return Optional.of((UserDetails) authentication.getPrincipal());
    }

    // Helper method to get the student profile associated with the logged-in user
    private Optional<Student> getAuthenticatedStudent() {
        return getAuthenticatedUserDetails()
                // The UserDetails username is often the email for our system
                .flatMap(userDetails -> studentRepository.findByEmail(userDetails.getUsername()));
    }

    // --- Service methods for each endpoint ---

    public Student getMyProfile() {
        // If the student profile doesn't exist, we return a null or an empty object rather than crashing.
        return getAuthenticatedStudent().orElse(null);
    }

    public List<Grade> getMyGrades() {
        // If the student profile exists, get their grades. Otherwise, return an empty list.
        return getAuthenticatedStudent()
                .map(student -> gradeRepository.findByStudentId(student.getId()))
                .orElse(Collections.emptyList());
    }

    public Map<String, Object> getMyFinancials() {
        Map<String, Object> response = new HashMap<>();

        Optional<Student> studentOpt = getAuthenticatedStudent();
        if (studentOpt.isEmpty()) {
            response.put("ledgerEntries", Collections.emptyList());
            response.put("currentBalance", BigDecimal.ZERO);
            return response;
        }

        Student student = studentOpt.get();
        List<FinancialLedger> ledger = financialLedgerRepository.findByStudentOrderByTransactionDateAsc(student);
        BigDecimal balance = financialLedgerRepository.getBalanceForStudent(student.getId());

        response.put("ledgerEntries", ledger);
        response.put("currentBalance", balance != null ? balance : BigDecimal.ZERO);
        return response;
    }

    public Page<BookTransaction> getMyLibraryActivity(Pageable pageable) {
        return getAuthenticatedStudent()
                .map(student -> bookTransactionRepository.findWithFilters(student.getStudentId(), pageable))
                .orElse(Page.empty());
    }

    public List<ScheduleEvent> getMySchedule(int year, int month) {
        Optional<Student> studentOpt = getAuthenticatedStudent();
        if (studentOpt.isEmpty() || studentOpt.get().getCurrentGrade() == null) {
            return Collections.emptyList();
        }

        Student student = studentOpt.get();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        // A more advanced query could filter by student.getCurrentGrade() here
        return scheduleEventRepository.findByDateRange(start, end);
    }

    public Page<Notification> getMyNotifications(Pageable pageable) {
        Optional<UserDetails> userDetailsOpt = getAuthenticatedUserDetails();
        if (userDetailsOpt.isEmpty()) {
            return Page.empty();
        }

        return userRepository.findByUsername(userDetailsOpt.get().getUsername())
                .map(user -> notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable))
                .orElse(Page.empty());
    }
}
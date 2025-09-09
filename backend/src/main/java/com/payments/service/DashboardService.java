package com.payments.service;

import com.payments.dto.DashboardHubDto;
import com.payments.dto.HubAlertDto;
import com.payments.dto.QuickActionDto;
import com.payments.model.User;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private PaymentRepository paymentRepository;
    // Inject other repositories as you build more features

    public DashboardHubDto getDashboardHub() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userRole = authentication.getAuthorities().stream()
                .findFirst().map(GrantedAuthority::getAuthority).orElse("");

        DashboardHubDto hub = new DashboardHubDto();
        hub.setGreeting("Welcome back, " + username + "!");

        // Build the alerts and actions based on the user's role
        switch (userRole) {
            case "ROLE_STUDENT":
                buildStudentHub(hub, username);
                break;
            case "ROLE_TEACHER":
                buildTeacherHub(hub, username);
                break;
            case "ROLE_FINANCE_ADMIN":
                buildFinanceAdminHub(hub, username);
                break;
            case "ROLE_ADMIN":
                // Admin can see a high-level overview
                buildAdminHub(hub, username);
                break;
            default:
                hub.setAlerts(new ArrayList<>());
                hub.setQuickActions(new ArrayList<>());
                break;
        }
        return hub;
    }

    private void buildStudentHub(DashboardHubDto hub, String username) {
        List<HubAlertDto> alerts = new ArrayList<>();
        List<QuickActionDto> actions = new ArrayList<>();
        User user = userRepository.findByUsername(username).orElseThrow();

        long unreadCount = notificationRepository.countByRecipientAndReadAtIsNull(user);
        alerts.add(new HubAlertDto("Unread Messages", String.valueOf(unreadCount), "Mail", "text-blue-400"));
        // TODO: Add logic for upcoming assignments, overdue books, etc.
        alerts.add(new HubAlertDto("Upcoming Assignments", "2", "ClipboardCheck", "text-amber-400"));

        actions.add(new QuickActionDto("View My Grades", "/student-portal", "GraduationCap"));
        actions.add(new QuickActionDto("Check My Timetable", "/student-portal", "Calendar"));
        actions.add(new QuickActionDto("My Library Account", "/student-portal", "BookOpen"));

        hub.setAlerts(alerts);
        hub.setQuickActions(actions);
    }

    private void buildTeacherHub(DashboardHubDto hub, String username) {
        List<HubAlertDto> alerts = new ArrayList<>();
        List<QuickActionDto> actions = new ArrayList<>();
        User user = userRepository.findByUsername(username).orElseThrow();

        long unreadCount = notificationRepository.countByRecipientAndReadAtIsNull(user);
        alerts.add(new HubAlertDto("Unread Messages", String.valueOf(unreadCount), "Mail", "text-blue-400"));
        // TODO: Add logic for assignments needing grading
        alerts.add(new HubAlertDto("Assignments to Grade", "5", "FileCheck2", "text-green-400"));

        actions.add(new QuickActionDto("Manage Academics", "/academics", "GraduationCap"));
        actions.add(new QuickActionDto("View Schedule", "/schedule", "Calendar"));
        actions.add(new QuickActionDto("Send Communication", "/communication", "Send"));

        hub.setAlerts(alerts);
        hub.setQuickActions(actions);
    }

    private void buildFinanceAdminHub(DashboardHubDto hub, String username) {
        List<HubAlertDto> alerts = new ArrayList<>();
        List<QuickActionDto> actions = new ArrayList<>();

        long pendingPayments = paymentRepository.countByStatus("PENDING");
        alerts.add(new HubAlertDto("Payments to Reconcile", String.valueOf(pendingPayments), "Banknote", "text-emerald-400"));
        // TODO: Add logic for overdue student accounts
        alerts.add(new HubAlertDto("Overdue Accounts", "12", "CircleAlert", "text-red-400"));

        actions.add(new QuickActionDto("Reconcile Payments", "/payment-allocation", "GitPullRequestArrow"));
        actions.add(new QuickActionDto("Manage Financials", "/financials", "Landmark"));
        actions.add(new QuickActionDto("Generate Reports", "/reports", "BarChart3"));

        hub.setAlerts(alerts);
        hub.setQuickActions(actions);
    }

    private void buildAdminHub(DashboardHubDto hub, String username) {
        List<HubAlertDto> alerts = new ArrayList<>();
        List<QuickActionDto> actions = new ArrayList<>();

        long totalStudents = studentRepository.count();
        alerts.add(new HubAlertDto("Total Students", String.valueOf(totalStudents), "Users", "text-blue-400"));
        long pendingPayments = paymentRepository.countByStatus("PENDING");
        alerts.add(new HubAlertDto("Payments to Reconcile", String.valueOf(pendingPayments), "Banknote", "text-emerald-400"));

        actions.add(new QuickActionDto("Manage Users & Roles", "/settings", "UsersCog"));
        actions.add(new QuickActionDto("Manage Students", "/students", "UserPlus"));
        actions.add(new QuickActionDto("View Audit Trail", "/audit-trail", "ShieldCheck"));

        hub.setAlerts(alerts);
        hub.setQuickActions(actions);
    }
}
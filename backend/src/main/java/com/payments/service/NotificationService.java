package com.payments.service;

import com.payments.dto.AnnouncementRequest;
import com.payments.model.*;
import com.payments.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication; // <-- IMPORT
import org.springframework.security.core.context.SecurityContextHolder; // <-- IMPORT
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private GuardianRepository guardianRepository;

    public Page<Notification> getNotificationsForUserByUsername(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
    }

    public long getUnreadCountByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return notificationRepository.countByRecipientAndReadAtIsNull(user);
    }

    @Transactional
    public void markAsReadByUsername(Long notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new SecurityException("User does not have permission to read this notification.");
        }

        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendAnnouncement(AnnouncementRequest request, String senderUsername, Long institutionIdOverride) {
        User sender = userRepository.findByUsername(senderUsername).orElseThrow(() -> new RuntimeException("Sender not found"));
        Institution targetInstitution;

        boolean isSuperAdmin = sender.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin && institutionIdOverride != null) {
            targetInstitution = new Institution();
            targetInstitution.setId(institutionIdOverride);
        } else {
            targetInstitution = sender.getInstitution();
            if (targetInstitution == null) throw new IllegalStateException("You must belong to an institution to send announcements.");
        }

        List<User> recipients = findRecipients(request.getTargetAudience(), targetInstitution);
        if (recipients.isEmpty()) return;

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setInstitution(targetInstitution);
            notification.setRecipient(recipient);
            notification.setSubject(request.getSubject());
            notification.setContent(request.getContent());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setType("ANNOUNCEMENT");
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    private List<User> findRecipients(String targetAudience, Institution institution) {
        if (targetAudience != null && targetAudience.startsWith("PARENTS_GRADE_")) {
            String gradeNumber = targetAudience.substring("PARENTS_GRADE_".length());
            String gradeName = "Grade " + gradeNumber;

            List<Student> studentsInGrade = studentRepository.findByCurrentGradeAndInstitution(gradeName, institution);
            if (studentsInGrade.isEmpty()) return new ArrayList<>();

            List<Guardian> guardians = guardianRepository.findByStudentIn(studentsInGrade);
            if (guardians.isEmpty()) return new ArrayList<>();

            List<String> guardianEmails = guardians.stream()
                    .map(Guardian::getEmail)
                    .filter(email -> email != null && !email.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());
            if (guardianEmails.isEmpty()) return new ArrayList<>();
            return userRepository.findByEmailIn(guardianEmails);
        }

        switch (targetAudience != null ? targetAudience.toUpperCase() : "") {
            case "ALL": return userRepository.findByInstitution(institution);
            case "ALL_STAFF": return userRepository.findByRoles_NameAndInstitution("ROLE_TEACH-ER", institution); // Assuming ROLE_TEACHER
            case "ALL_STUDENTS": return userRepository.findByRoles_NameAndInstitution("ROLE_STUDENT", institution);
            default: return new ArrayList<>();
        }
    }

}
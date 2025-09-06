package com.payments.service;

import com.payments.dto.AnnouncementRequest;
import com.payments.model.Guardian;
import com.payments.model.Notification;
import com.payments.model.Student;
import com.payments.model.User;
import com.payments.repository.GuardianRepository;
import com.payments.repository.NotificationRepository;
import com.payments.repository.StudentRepository;
import com.payments.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public void sendAnnouncement(AnnouncementRequest request, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderUsername));

        List<User> recipients = findRecipients(request.getTargetAudience(), request.getSpecificUserIds());
        if (recipients.isEmpty()) return;

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setSubject(request.getSubject());
            notification.setContent("From " + sender.getUsername() + ":\n\n" + request.getContent());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setType("ANNOUNCEMENT");
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    private List<User> findRecipients(String targetAudience, List<Long> specificUserIds) {
        if (specificUserIds != null && !specificUserIds.isEmpty()) {
            return userRepository.findAllById(specificUserIds);
        }

        if (targetAudience != null && targetAudience.startsWith("PARENTS_GRADE_")) {
            String gradeNumber = targetAudience.substring("PARENTS_GRADE_".length());
            String gradeName = "Grade " + gradeNumber;

            List<Student> studentsInGrade = studentRepository.findByCurrentGrade(gradeName);
            if (studentsInGrade.isEmpty()) return new ArrayList<>();

            List<Guardian> guardians = guardianRepository.findByStudentIn(studentsInGrade);

            List<String> guardianEmails = guardians.stream()
                    .map(Guardian::getEmail)
                    .filter(email -> email != null && !email.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            if (guardianEmails.isEmpty()) return new ArrayList<>();

            return userRepository.findByEmailIn(guardianEmails);
        }

        switch (targetAudience != null ? targetAudience.toUpperCase() : "") {
            case "ALL": return userRepository.findAll();
            case "ALL_STAFF": return userRepository.findByRoles_Name("ROLE_TEACHER");
            case "ALL_STUDENTS": return userRepository.findByRoles_Name("ROLE_STUDENT");
            default: return new ArrayList<>();
        }
    }
}

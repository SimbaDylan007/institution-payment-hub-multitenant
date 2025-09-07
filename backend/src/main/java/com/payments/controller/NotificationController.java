package com.payments.controller;

import com.payments.dto.AnnouncementRequest;
import com.payments.model.Notification;
import com.payments.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {  // <-- THIS MUST MATCH THE FILE NAME

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserDetails currentUser,
            Pageable pageable) {

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                notificationService.getNotificationsForUserByUsername(currentUser.getUsername(), pageable)
        );
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(@AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        long count = notificationService.getUnreadCountByUsername(currentUser.getUsername());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAsReadByUsername(id, currentUser.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/announcements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> sendAnnouncement(
            @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetails sender) {

        if (sender == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.sendAnnouncement(request, sender.getUsername());
        return ResponseEntity.ok().build();
    }
}

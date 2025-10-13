package com.payments.controller;

import com.payments.dto.AnnouncementRequest;
import com.payments.model.Notification;
import com.payments.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Gets notifications for the currently logged-in user.
     * This is inherently tenant-aware because the user belongs to an institution.
     */
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

    /**
     * Gets the unread notification count for the currently logged-in user.
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(@AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        long count = notificationService.getUnreadCountByUsername(currentUser.getUsername());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Marks a specific notification as read for the currently logged-in user.
     */
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAsReadByUsername(id, currentUser.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Sends an announcement. This endpoint is now tenant-aware.
     * Regular admins can only send to their own institution.
     * Super-admins can specify a target institution.
     */
    @PostMapping("/announcements")
    // Allow admins and super-admins to send announcements
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'IT_ADMIN', 'FINANCE_ADMIN')")
    public ResponseEntity<Void> sendAnnouncement(
            @RequestBody AnnouncementRequest request,
            @RequestParam(required = false) Long institutionId, // <-- Accept optional institutionId
            @AuthenticationPrincipal UserDetails sender) {

        if (sender == null) {
            return ResponseEntity.status(401).build();
        }
        // Pass the institutionId to the service method
        notificationService.sendAnnouncement(request, sender.getUsername(), institutionId);
        return ResponseEntity.ok().build();
    }
}
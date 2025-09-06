package com.payments.repository;

import com.payments.model.Notification;
import com.payments.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ✅ Find all notifications for a specific user, most recent first
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    // ✅ Count unread notifications for a user
    long countByRecipientAndReadAtIsNull(User recipient);
}

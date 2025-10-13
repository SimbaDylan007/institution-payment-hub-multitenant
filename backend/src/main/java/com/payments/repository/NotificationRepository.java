package com.payments.repository;

import com.payments.model.Institution;
import com.payments.model.Notification;
import com.payments.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // This is the correct method for fetching a user's personal notifications
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    // This is correct for getting the unread count badge
    long countByRecipientAndReadAtIsNull(User recipient);

    // This is the new method for a super-admin to view all notifications for an institution
    Page<Notification> findByInstitution(Institution institution, Pageable pageable);
}
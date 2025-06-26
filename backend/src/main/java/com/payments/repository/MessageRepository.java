
package com.payments.repository;

import com.payments.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findBySenderId(Long senderId);
    
    List<Message> findByRecipientId(Long recipientId);
    
    List<Message> findByRecipientIdAndIsReadFalse(Long recipientId);
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId OR m.recipientId = :userId) ORDER BY m.sentAt DESC")
    List<Message> findMessagesByUser(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :senderId AND m.recipientId = :receiverId) OR (m.senderId = :receiverId AND m.recipientId = :senderId) ORDER BY m.sentAt DESC")
    List<Message> findConversation(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
    
    List<Message> findByMessageTypeAndIsReadFalse(String messageType);
}

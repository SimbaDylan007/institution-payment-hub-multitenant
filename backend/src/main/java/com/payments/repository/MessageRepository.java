
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
    
    List<Message> findByReceiverId(Long receiverId);
    
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) ORDER BY m.sentAt DESC")
    List<Message> findMessagesByUser(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Message m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId ORDER BY m.sentAt DESC")
    List<Message> findConversation(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
    
    List<Message> findByMessageTypeAndIsReadFalse(String messageType);
}

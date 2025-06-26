
package com.payments.service;

import com.payments.model.Message;
import com.payments.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommunicationService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    // Message management
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }
    
    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }
    
    public List<Message> getSentMessages(Long senderId) {
        return messageRepository.findBySenderId(senderId);
    }
    
    public List<Message> getReceivedMessages(Long receiverId) {
        return messageRepository.findByReceiverId(receiverId);
    }
    
    public List<Message> getUnreadMessages(Long receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
    }
    
    public List<Message> getConversation(Long senderId, Long receiverId) {
        return messageRepository.findConversation(senderId, receiverId);
    }
    
    public List<Message> getMessagesByUser(Long userId) {
        return messageRepository.findMessagesByUser(userId);
    }
    
    @Transactional
    public Message sendMessage(Message message) {
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }
    
    @Transactional
    public Message markAsRead(Long messageId) {
        Optional<Message> optionalMessage = messageRepository.findById(messageId);
        if (optionalMessage.isPresent()) {
            Message message = optionalMessage.get();
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            return messageRepository.save(message);
        }
        return null;
    }
    
    @Transactional
    public void markAllAsRead(Long receiverId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
        for (Message message : unreadMessages) {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
        }
    }
    
    @Transactional
    public Message sendAnnouncement(String title, String content, Long senderId) {
        Message announcement = new Message();
        announcement.setSubject(title);
        announcement.setContent(content);
        announcement.setMessageType("ANNOUNCEMENT");
        announcement.setSentAt(LocalDateTime.now());
        announcement.setRead(false);
        // For announcements, we might want to send to all users or specific groups
        return messageRepository.save(announcement);
    }
    
    @Transactional
    public boolean deleteMessage(Long messageId) {
        if (messageRepository.existsById(messageId)) {
            messageRepository.deleteById(messageId);
            return true;
        }
        return false;
    }
    
    public long getUnreadMessageCount(Long userId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(userId).size();
    }
}


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
    
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }
    
    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }
    
    public List<Message> getSentMessages(Long senderId) {
        return messageRepository.findBySenderId(senderId);
    }
    
    public List<Message> getReceivedMessages(Long recipientId) {
        return messageRepository.findByRecipientId(recipientId);
    }
    
    public List<Message> getUnreadMessages(Long recipientId) {
        return messageRepository.findByRecipientIdAndIsReadFalse(recipientId);
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
        if (message.getMessageType() == null) {
            message.setMessageType("DIRECT");
        }
        return messageRepository.save(message);
    }
    
    @Transactional
    public Message markAsRead(Long messageId) {
        Optional<Message> optionalMessage = messageRepository.findById(messageId);
        if (optionalMessage.isPresent()) {
            Message message = optionalMessage.get();
            message.setIsRead(true);
            return messageRepository.save(message);
        }
        return null;
    }
    
    @Transactional
    public void markAllAsRead(Long recipientId) {
        List<Message> unreadMessages = messageRepository.findByRecipientIdAndIsReadFalse(recipientId);
        for (Message message : unreadMessages) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }
    
    @Transactional
    public Message sendAnnouncement(String title, String content, Long senderId) {
        Message announcement = new Message();
        announcement.setSubject(title);
        announcement.setContent(content);
        announcement.setSenderId(senderId);
        announcement.setRecipientId(0L); // Broadcast message
        announcement.setMessageType("ANNOUNCEMENT");
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
        return messageRepository.findByRecipientIdAndIsReadFalse(userId).size();
    }
}

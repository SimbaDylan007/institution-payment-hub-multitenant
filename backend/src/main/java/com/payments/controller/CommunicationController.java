
package com.payments.controller;

import com.payments.model.Message;
import com.payments.service.CommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/communication")
@CrossOrigin(origins = "*")
public class CommunicationController {
    
    @Autowired
    private CommunicationService communicationService;
    
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        List<Message> messages = communicationService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/messages/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        Optional<Message> message = communicationService.getMessageById(id);
        return message.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/messages/sent/{senderId}")
    public ResponseEntity<List<Message>> getSentMessages(@PathVariable Long senderId) {
        List<Message> messages = communicationService.getSentMessages(senderId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/messages/received/{receiverId}")
    public ResponseEntity<List<Message>> getReceivedMessages(@PathVariable Long receiverId) {
        List<Message> messages = communicationService.getReceivedMessages(receiverId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/messages/unread/{receiverId}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable Long receiverId) {
        List<Message> messages = communicationService.getUnreadMessages(receiverId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/messages/conversation/{senderId}/{receiverId}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable Long senderId, @PathVariable Long receiverId) {
        List<Message> messages = communicationService.getConversation(senderId, receiverId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/messages/user/{userId}")
    public ResponseEntity<List<Message>> getMessagesByUser(@PathVariable Long userId) {
        List<Message> messages = communicationService.getMessagesByUser(userId);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message sentMessage = communicationService.sendMessage(message);
        return ResponseEntity.ok(sentMessage);
    }
    
    @PutMapping("/messages/{id}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long id) {
        Message message = communicationService.markAsRead(id);
        if (message != null) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/messages/read-all/{receiverId}")
    public ResponseEntity<String> markAllAsRead(@PathVariable Long receiverId) {
        communicationService.markAllAsRead(receiverId);
        return ResponseEntity.ok("All messages marked as read");
    }
    
    @PostMapping("/announcements")
    public ResponseEntity<Message> sendAnnouncement(@RequestParam String title, 
                                                  @RequestParam String content,
                                                  @RequestParam Long senderId) {
        Message announcement = communicationService.sendAnnouncement(title, content, senderId);
        return ResponseEntity.ok(announcement);
    }
    
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id) {
        boolean deleted = communicationService.deleteMessage(id);
        if (deleted) {
            return ResponseEntity.ok("Message deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/messages/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadMessageCount(@PathVariable Long userId) {
        long count = communicationService.getUnreadMessageCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }
}

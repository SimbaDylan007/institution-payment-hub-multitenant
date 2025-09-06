package com.payments.dto;

import java.util.List;

public class AnnouncementRequest {
    private String subject;
    private String content;
    private String targetAudience;
    private List<Long> specificUserIds;

    // Getters & setters
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }

    public List<Long> getSpecificUserIds() { return specificUserIds; }
    public void setSpecificUserIds(List<Long> specificUserIds) { this.specificUserIds = specificUserIds; }
}


package com.payments.dto;

import java.util.List;

public class BulkUserImportDto {
    private List<UserCreationDto> users;
    private boolean sendWelcomeEmail;

    // Constructors
    public BulkUserImportDto() {}

    public BulkUserImportDto(List<UserCreationDto> users, boolean sendWelcomeEmail) {
        this.users = users;
        this.sendWelcomeEmail = sendWelcomeEmail;
    }

    // Getters and Setters
    public List<UserCreationDto> getUsers() { return users; }
    public void setUsers(List<UserCreationDto> users) { this.users = users; }
    public boolean isSendWelcomeEmail() { return sendWelcomeEmail; }
    public void setSendWelcomeEmail(boolean sendWelcomeEmail) { this.sendWelcomeEmail = sendWelcomeEmail; }
}

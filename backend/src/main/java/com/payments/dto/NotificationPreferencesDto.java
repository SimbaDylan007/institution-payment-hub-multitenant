package com.payments.dto;

public class NotificationPreferencesDto {
    private boolean newStudentEmail;
    private boolean gradeUpdatesEmail;
    private boolean attendanceEmail;
    private boolean emergencyEmail;
    private boolean emergencySMS;
    private boolean attendanceSMS;
    private boolean eventReminderSMS;
    private boolean gradeSMS;

    // Getters and Setters...
    public boolean isNewStudentEmail() { return newStudentEmail; }
    public void setNewStudentEmail(boolean newStudentEmail) { this.newStudentEmail = newStudentEmail; }
    // ... and so on for all boolean fields
    public boolean isGradeUpdatesEmail() { return gradeUpdatesEmail; }
    public void setGradeUpdatesEmail(boolean gradeUpdatesEmail) { this.gradeUpdatesEmail = gradeUpdatesEmail; }
    public boolean isAttendanceEmail() { return attendanceEmail; }
    public void setAttendanceEmail(boolean attendanceEmail) { this.attendanceEmail = attendanceEmail; }
    public boolean isEmergencyEmail() { return emergencyEmail; }
    public void setEmergencyEmail(boolean emergencyEmail) { this.emergencyEmail = emergencyEmail; }
    public boolean isEmergencySMS() { return emergencySMS; }
    public void setEmergencySMS(boolean emergencySMS) { this.emergencySMS = emergencySMS; }
    public boolean isAttendanceSMS() { return attendanceSMS; }
    public void setAttendanceSMS(boolean attendanceSMS) { this.attendanceSMS = attendanceSMS; }
    public boolean isEventReminderSMS() { return eventReminderSMS; }
    public void setEventReminderSMS(boolean eventReminderSMS) { this.eventReminderSMS = eventReminderSMS; }
    public boolean isGradeSMS() { return gradeSMS; }
    public void setGradeSMS(boolean gradeSMS) { this.gradeSMS = gradeSMS; }
}
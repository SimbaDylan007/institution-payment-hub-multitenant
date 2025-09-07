package com.payments.controller;

import com.payments.model.*;
import com.payments.service.StudentPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student-portal")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('STUDENT')") // Ensures only users with the STUDENT role can access
public class StudentPortalController {

    @Autowired
    private StudentPortalService studentPortalService;

    // Endpoint to get the student's own profile details
    @GetMapping("/my-profile")
    public ResponseEntity<Student> getMyProfile() {
        return ResponseEntity.ok(studentPortalService.getMyProfile());
    }

    // Endpoint to get the student's own grades
    @GetMapping("/my-grades")
    public ResponseEntity<List<Grade>> getMyGrades() {
        return ResponseEntity.ok(studentPortalService.getMyGrades());
    }

    // Endpoint to get the student's own financial ledger
    @GetMapping("/my-financials")
    public ResponseEntity<Map<String, Object>> getMyFinancials() {
        return ResponseEntity.ok(studentPortalService.getMyFinancials());
    }

    // Endpoint to get the student's own library transactions
    @GetMapping("/my-library-activity")
    public ResponseEntity<Page<BookTransaction>> getMyLibraryActivity(Pageable pageable) {
        return ResponseEntity.ok(studentPortalService.getMyLibraryActivity(pageable));
    }

    // Endpoint to get the student's own schedule/timetable
    @GetMapping("/my-schedule")
    public ResponseEntity<List<ScheduleEvent>> getMySchedule(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(studentPortalService.getMySchedule(year, month));
    }

    // Endpoint to get the student's own notifications/messages
    @GetMapping("/my-notifications")
    public ResponseEntity<Page<Notification>> getMyNotifications(Pageable pageable) {
        return ResponseEntity.ok(studentPortalService.getMyNotifications(pageable));
    }
}
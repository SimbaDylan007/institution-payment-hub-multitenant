
package com.payments.controller;

import com.payments.model.Staff;
import com.payments.model.StaffAttendance;
import com.payments.model.LeaveRequest;
import com.payments.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'IT_ADMIN')")
public class StaffManagementController {
    
    @Autowired
    private StaffService staffService;

    @GetMapping
    public ResponseEntity<Page<Staff>> getAllStaff(
            Pageable pageable,
            @RequestParam(required = false, defaultValue = "") String searchTerm) {
        Page<Staff> staffPage = staffService.getAllStaff(pageable, searchTerm);
        return ResponseEntity.ok(staffPage);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        Optional<Staff> staff = staffService.getStaffById(id);
        return staff.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/employee-id/{employeeId}")
    public ResponseEntity<Staff> getStaffByEmployeeId(@PathVariable String employeeId) {
        Optional<Staff> staff = staffService.getStaffByEmployeeId(employeeId);
        return staff.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<List<Staff>> getStaffByDepartment(@PathVariable String department) {
        List<Staff> staff = staffService.getStaffByDepartment(department);
        return ResponseEntity.ok(staff);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Staff>> getStaffByStatus(@PathVariable String status) {
        List<Staff> staff = staffService.getStaffByEmploymentStatus(status);
        return ResponseEntity.ok(staff);
    }
    
    @PostMapping
    public ResponseEntity<Staff> createStaff(@RequestBody Staff staff) {
        Staff createdStaff = staffService.createStaff(staff);
        return ResponseEntity.ok(createdStaff);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @RequestBody Staff staff) {
        Staff updatedStaff = staffService.updateStaff(id, staff);
        if (updatedStaff != null) {
            return ResponseEntity.ok(updatedStaff);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        boolean deleted = staffService.deleteStaff(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // Attendance endpoints
    @GetMapping("/{staffId}/attendance")
    public ResponseEntity<List<StaffAttendance>> getStaffAttendance(@PathVariable Long staffId) {
        List<StaffAttendance> attendance = staffService.getStaffAttendance(staffId);
        return ResponseEntity.ok(attendance);
    }
    
    @PostMapping("/{staffId}/attendance")
    public ResponseEntity<StaffAttendance> markAttendance(@PathVariable Long staffId, @RequestBody StaffAttendance attendance) {
        Optional<Staff> staff = staffService.getStaffById(staffId);
        if (staff.isPresent()) {
            attendance.setStaff(staff.get());
            StaffAttendance marked = staffService.markAttendance(attendance);
            return ResponseEntity.ok(marked);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Leave request endpoints
    @GetMapping("/{staffId}/leave-requests")
    public ResponseEntity<List<LeaveRequest>> getStaffLeaveRequests(@PathVariable Long staffId) {
        List<LeaveRequest> requests = staffService.getStaffLeaveRequests(staffId);
        return ResponseEntity.ok(requests);
    }
    
    @PostMapping("/{staffId}/leave-requests")
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@PathVariable Long staffId, @RequestBody LeaveRequest leaveRequest) {
        Optional<Staff> staff = staffService.getStaffById(staffId);
        if (staff.isPresent()) {
            leaveRequest.setStaff(staff.get());
            LeaveRequest submitted = staffService.submitLeaveRequest(leaveRequest);
            return ResponseEntity.ok(submitted);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/leave-requests/{requestId}/approve")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(@PathVariable Long requestId, @RequestParam String approvedBy) {
        LeaveRequest approved = staffService.approveLeaveRequest(requestId, approvedBy);
        if (approved != null) {
            return ResponseEntity.ok(approved);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/leave-requests/status/{status}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByStatus(@PathVariable String status) {
        List<LeaveRequest> requests = staffService.getLeaveRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Long> getStaffCount(@RequestParam String status) {
        Long count = staffService.getStaffCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkAddStaff(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("Please upload a file!", HttpStatus.BAD_REQUEST);
        }
        try {
            List<Staff> savedStaff = staffService.bulkAddStaff(file);
            return new ResponseEntity<>(savedStaff, HttpStatus.CREATED);
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }



}

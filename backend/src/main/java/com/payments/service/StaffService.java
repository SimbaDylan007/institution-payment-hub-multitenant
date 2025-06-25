
package com.payments.service;

import com.payments.model.Staff;
import com.payments.model.StaffAttendance;
import com.payments.model.LeaveRequest;
import com.payments.repository.StaffRepository;
import com.payments.repository.StaffAttendanceRepository;
import com.payments.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class StaffService {
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private StaffAttendanceRepository staffAttendanceRepository;
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }
    
    public Optional<Staff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }
    
    public Optional<Staff> getStaffByEmployeeId(String employeeId) {
        return staffRepository.findByEmployeeId(employeeId);
    }
    
    public List<Staff> getStaffByDepartment(String department) {
        return staffRepository.findByDepartment(department);
    }
    
    public List<Staff> getStaffByEmploymentStatus(String status) {
        return staffRepository.findByEmploymentStatus(status);
    }
    
    @Transactional
    public Staff createStaff(Staff staff) {
        return staffRepository.save(staff);
    }
    
    @Transactional
    public Staff updateStaff(Long id, Staff staffDetails) {
        Optional<Staff> optionalStaff = staffRepository.findById(id);
        if (optionalStaff.isPresent()) {
            Staff staff = optionalStaff.get();
            staff.setFirstName(staffDetails.getFirstName());
            staff.setLastName(staffDetails.getLastName());
            staff.setEmail(staffDetails.getEmail());
            staff.setPhone(staffDetails.getPhone());
            staff.setAddress(staffDetails.getAddress());
            staff.setDepartment(staffDetails.getDepartment());
            staff.setPosition(staffDetails.getPosition());
            staff.setEmploymentStatus(staffDetails.getEmploymentStatus());
            staff.setSalary(staffDetails.getSalary());
            staff.setQualifications(staffDetails.getQualifications());
            staff.setSpecializations(staffDetails.getSpecializations());
            return staffRepository.save(staff);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteStaff(Long id) {
        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Attendance management
    public List<StaffAttendance> getStaffAttendance(Long staffId) {
        return staffAttendanceRepository.findByStaffId(staffId);
    }
    
    public List<StaffAttendance> getAttendanceByDateRange(Long staffId, LocalDate startDate, LocalDate endDate) {
        return staffAttendanceRepository.findByStaffIdAndDateRange(staffId, startDate, endDate);
    }
    
    @Transactional
    public StaffAttendance markAttendance(StaffAttendance attendance) {
        return staffAttendanceRepository.save(attendance);
    }
    
    // Leave management
    public List<LeaveRequest> getStaffLeaveRequests(Long staffId) {
        return leaveRequestRepository.findByStaffId(staffId);
    }
    
    public List<LeaveRequest> getLeaveRequestsByStatus(String status) {
        return leaveRequestRepository.findByStatus(status);
    }
    
    @Transactional
    public LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest) {
        leaveRequest.setApplicationDate(LocalDate.now());
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }
    
    @Transactional
    public LeaveRequest approveLeaveRequest(Long requestId, String approvedBy) {
        Optional<LeaveRequest> optionalRequest = leaveRequestRepository.findById(requestId);
        if (optionalRequest.isPresent()) {
            LeaveRequest request = optionalRequest.get();
            request.setStatus("APPROVED");
            request.setApprovedBy(approvedBy);
            request.setApprovalDate(LocalDate.now());
            return leaveRequestRepository.save(request);
        }
        return null;
    }
    
    public Long getStaffCountByStatus(String status) {
        return staffRepository.countByEmploymentStatus(status);
    }
}

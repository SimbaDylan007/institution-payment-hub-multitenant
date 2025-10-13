package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.*;
import com.payments.repository.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestParam;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import org.hibernate.Session;

@Service
public class StaffService {

    @Autowired private StaffRepository staffRepository;
    @Autowired private StaffAttendanceRepository staffAttendanceRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Centralized helper method to generate a unique employee ID.
     * e.g., "E25" + "123456" -> "E25123456"
     */
    private String generateNewEmployeeId() {
        String year = String.valueOf(Year.now().getValue()).substring(2);
        int randomNum = new Random().nextInt(900000) + 100000; // 6-digit random number
        return "E" + year + randomNum;
    }

    /**
     * This is the corrected and robust bulk import method.
     * It intelligently handles both CSV and Excel files, identifies new vs. existing staff,
     * and auto-generates IDs only for new staff members.
     */
//    @Transactional
//    public List<Staff> bulkAddStaff(MultipartFile file, Long institutionIdOverride)) throws IOException, CsvValidationException {
//        // --- TENANCY ENFORCEMENT ---
//        User currentUser = getCurrentUser();
//        Institution targetInstitution = determineTargetInstitution(currentUser, institutionIdOverride);
//        if (currentInstitution == null) {
//            throw new IllegalStateException("Super Admins must select a specific institution before bulk importing staff.");
//        }
//
//        List<Staff> processedStaffList = new ArrayList<>();
//        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
//
//        if (filename.endsWith(".csv")) {
//            try (Reader reader = new InputStreamReader(file.getInputStream()); CSVReader csvReader = new CSVReader(reader)) {
//                csvReader.skip(1); String[] line;
//                while ((line = csvReader.readNext()) != null) {
//                    processStaffRecord(line[3], line[1], line[2], line[4], line[5], line[6], line[7], currentInstitution, processedStaffList);
//                }
//            }
//        } else if (filename.endsWith(".xlsx")) {
//            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
//                Sheet sheet = workbook.getSheetAt(0);
//                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
//                    Row row = sheet.getRow(i); if (row == null) continue;
//                    processStaffRecord(getCellValueAsString(row.getCell(3)), getCellValueAsString(row.getCell(1)), getCellValueAsString(row.getCell(2)), getCellValueAsString(row.getCell(4)), getCellValueAsString(row.getCell(5)), getCellValueAsString(row.getCell(6)), getCellValueAsString(row.getCell(7)), currentInstitution, processedStaffList);
//                }
//            }
//        } else {
//            throw new IllegalArgumentException("Invalid file type. Please upload a CSV or XLSX file.");
//        }
//
//        if (processedStaffList.isEmpty()) { throw new IllegalArgumentException("File contains no valid staff data to import."); }
//        return staffRepository.saveAll(processedStaffList);
//    }

    @Transactional
    public List<Staff> bulkAddStaff(MultipartFile file, Long institutionIdOverride) throws IOException, CsvValidationException {
        // 1. Determine the target institution for the import
        User currentUser = getCurrentUser();
        Institution targetInstitution = determineTargetInstitution(currentUser, institutionIdOverride);

        List<Staff> processedStaffList = new ArrayList<>();
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();

        if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                csvReader.skip(1); // Skip header row
                String[] line;
                while ((line = csvReader.readNext()) != null) {
                    // Pass the determined targetInstitution to the helper method
                    processStaffRecord(line[3], line[1], line[2], line[4], line[5], line[6], line[7], targetInstitution, processedStaffList);
                }
            }
        } else if (filename.endsWith(".xlsx")) {
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    // Pass the determined targetInstitution to the helper method
                    processStaffRecord(
                            getCellValueAsString(row.getCell(3)), getCellValueAsString(row.getCell(1)),
                            getCellValueAsString(row.getCell(2)), getCellValueAsString(row.getCell(4)),
                            getCellValueAsString(row.getCell(5)), getCellValueAsString(row.getCell(6)),
                            getCellValueAsString(row.getCell(7)), targetInstitution, processedStaffList
                    );
                }
            }
        } else {
            throw new IllegalArgumentException("Invalid file type. Please upload a CSV or XLSX file.");
        }

        if (processedStaffList.isEmpty()) {
            throw new IllegalArgumentException("File contains no valid staff data to import.");
        }
        return staffRepository.saveAll(processedStaffList);
    }



    private Institution determineTargetInstitution(User currentUser, Long institutionIdOverride) {
        if (isSuperAdmin(currentUser) && institutionIdOverride != null) {
            Institution institution = entityManager.find(Institution.class, institutionIdOverride);
            if (institution == null) throw new IllegalArgumentException("Invalid institution ID for bulk import.");
            return institution;
        }
        Institution target = currentUser.getInstitution();
        if (target == null) throw new IllegalStateException("You must belong to an institution to perform this action.");
        return target;
    }

    // Helper method updated to be tenant-aware
    private void processStaffRecord(String email, String firstName, String lastName, String phone, String department, String position, String hireDateStr, Institution institution, List<Staff> processedStaffList) {
        if (email == null || email.trim().isEmpty() || firstName == null || firstName.trim().isEmpty()) { return; }

        // Find existing staff by email WITHIN the current institution
        Optional<Staff> existingStaffOpt = staffRepository.findByEmail(email.trim());

        Staff staff = existingStaffOpt.orElse(new Staff());

        // Security check: If staff exists but belongs to another institution, skip/throw error
        if (staff.getId() != null && !staff.getInstitution().getId().equals(institution.getId())) {
            System.err.println("Skipping staff with email " + email + " as they belong to another institution.");
            return;
        }

        if (staff.getId() == null) {
            staff.setEmployeeId(generateNewEmployeeId());
            staff.setEmploymentStatus("ACTIVE");
            staff.setInstitution(institution); // Set institution for new staff
        }

        staff.setFirstName(firstName); staff.setLastName(lastName); staff.setEmail(email.trim());
        staff.setPhone(phone); staff.setDepartment(department); staff.setPosition(position);
        staff.setHireDate(parseDate(hireDateStr));

        processedStaffList.add(staff);
    }

//    /**
//     * Helper method to process a single staff record from a file.
//     * It finds existing staff by email to update them, or creates a new staff
//     * member with a generated ID if no existing record is found.
//     */
//    private void processStaffRecord(String email, String firstName, String lastName, String phone, String department, String position, String hireDateStr, List<Staff> processedStaffList) {
//        if (email == null || email.trim().isEmpty() || firstName == null || firstName.trim().isEmpty()) {
//            return; // Skip records with no email or first name
//        }
//
//        // Use email as the reliable unique identifier for finding existing staff
//        Optional<Staff> existingStaffOpt = staffRepository.findByEmail(email.trim());
//
//        Staff staff = existingStaffOpt.orElse(new Staff());
//
//        // If it's a new staff member (ID is null), generate a new employee ID
//        if (staff.getId() == null) {
//            staff.setEmployeeId(generateNewEmployeeId());
//            staff.setEmploymentStatus("ACTIVE"); // Default status for new hires
//        }
//
//        // Update or set all other properties from the file data
//        staff.setFirstName(firstName);
//        staff.setLastName(lastName);
//        staff.setEmail(email.trim());
//        staff.setPhone(phone);
//        staff.setDepartment(department);
//        staff.setPosition(position);
//        staff.setHireDate(parseDate(hireDateStr));
//
//        processedStaffList.add(staff);
//    }

    // --- Helper methods for parsing ---
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) { return null; }
        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd"), DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"), DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
        };
        for (DateTimeFormatter formatter : formatters) {
            try { return LocalDate.parse(dateStr, formatter); }
            catch (DateTimeParseException e) { /* continue */ }
        }
        throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) { return ""; }
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    // This handles both integers and decimals without adding ".0"
                    return new java.text.DecimalFormat("0.##############").format(cell.getNumericCellValue());
                }
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA: return cell.getCellFormula();
            default: return "";
        }
    }

    // --- All your other existing methods ---
    public Page<Staff> getAllStaff(Pageable pageable, String searchTerm, Long institutionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // The isSuperAdmin helper doesn't need an argument here
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin && institutionId != null) {
            Session session = entityManager.unwrap(Session.class); // This now compiles
            session.disableFilter("institutionFilter");
            return staffRepository.findAllByInstitutionIdAndSearch(institutionId, searchTerm, pageable);
        }
        return staffRepository.findAllWithSearch(searchTerm, pageable);
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
    // Helper method to get the current user from security context
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User)) {
            throw new IllegalStateException("User not authenticated.");
        }
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }

    @Transactional
    public Staff createStaff(Staff staff) {
        // --- TENANCY ENFORCEMENT ---
        // Get the current user and their institution
        User currentUser = getCurrentUser();
        if (currentUser.getInstitution() == null) {
            throw new IllegalStateException("Super Admins cannot directly create staff. They must select an institution first.");
        }
        // Set the institution on the new staff member before saving
        staff.setInstitution(currentUser.getInstitution());

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

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }
}
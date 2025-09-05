package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.LeaveRequest;
import com.payments.model.Staff;
import com.payments.model.StaffAttendance;
import com.payments.repository.LeaveRequestRepository;
import com.payments.repository.StaffAttendanceRepository;
import com.payments.repository.StaffRepository;
import org.apache.poi.ss.usermodel.Cell;
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

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired private StaffRepository staffRepository;
    @Autowired private StaffAttendanceRepository staffAttendanceRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;

    @Transactional
    public List<Staff> bulkAddStaff(MultipartFile file) throws IOException, CsvValidationException {
        List<Staff> processedStaff = new ArrayList<>();
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Invalid file type. Please upload a CSV or XLSX file.");
        }

        if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                csvReader.skip(1); // Skip header row
                String[] line;
                while ((line = csvReader.readNext()) != null) {
                    String employeeId = line[0];
                    Optional<Staff> existingStaffOpt = staffRepository.findByEmployeeId(employeeId);

                    Staff staff = existingStaffOpt.orElse(new Staff()); // Get existing or create new

                    staff.setEmployeeId(employeeId);
                    staff.setFirstName(line[1]);
                    staff.setLastName(line[2]);
                    staff.setEmail(line[3]);
                    staff.setPhone(line[4]);
                    staff.setDepartment(line[5]);
                    staff.setPosition(line[6]);
                    staff.setHireDate(parseDate(line[7]));

                    if (!existingStaffOpt.isPresent()) { // Only set status for new staff
                        staff.setEmploymentStatus("ACTIVE");
                    }
                    processedStaff.add(staff);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
            }
        } else { // XLSX
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    String employeeId = getCellValueAsString(row.getCell(0));
                    Optional<Staff> existingStaffOpt = staffRepository.findByEmployeeId(employeeId);

                    Staff staff = existingStaffOpt.orElse(new Staff());

                    staff.setEmployeeId(employeeId);
                    staff.setFirstName(getCellValueAsString(row.getCell(1)));
                    staff.setLastName(getCellValueAsString(row.getCell(2)));
                    staff.setEmail(getCellValueAsString(row.getCell(3)));
                    staff.setPhone(getCellValueAsString(row.getCell(4)));
                    staff.setDepartment(getCellValueAsString(row.getCell(5)));
                    staff.setPosition(getCellValueAsString(row.getCell(6)));
                    staff.setHireDate(parseDate(getCellValueAsString(row.getCell(7))));

                    if (!existingStaffOpt.isPresent()) {
                        staff.setEmploymentStatus("ACTIVE");
                    }
                    processedStaff.add(staff);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
            }
        }

        if (processedStaff.isEmpty()) {
            throw new IllegalArgumentException("File contains no staff data to import.");
        }
        // The saveAll method handles both new inserts and updates for existing entities
        return staffRepository.saveAll(processedStaff);
    }

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
    public Page<Staff> getAllStaff(Pageable pageable, String searchTerm) {
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
}
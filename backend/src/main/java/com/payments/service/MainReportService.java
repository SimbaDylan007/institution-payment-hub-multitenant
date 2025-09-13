// src/main/java/com/payments/service/MainReportService.java

package com.payments.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import com.payments.model.*;
import com.payments.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.HashMap;


@Service
public class MainReportService {

    // --- REPOSITORIES ---
    @Autowired private StudentRepository studentRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private FeeTypeRepository feeTypeRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private BookTransactionRepository bookTransactionRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private StaffAttendanceRepository staffAttendanceRepository;
    @Autowired private FacilityRepository facilityRepository;

    public ByteArrayInputStream generateReport(String reportType, String format, Map<String, String> filters) throws IOException {
        switch (reportType) {
            // Financial Reports
            case "FINANCIAL_STATEMENT":
                return generateFinancialStatement(format, filters);
            case "FINANCIAL_SUMMARY_PAYMENTS":
                return generateFinancialSummaryReport(TransactionType.CREDIT, format, filters);
            case "FINANCIAL_SUMMARY_CHARGES":
                return generateFinancialSummaryReport(TransactionType.DEBIT, format, filters);
            case "PAYMENT_ALERTS":
                return generateListReport(paymentRepository.findAll(), "Payment Alerts", format, PaymentAlert.class);
            case "ALL_FEE_TYPES":
                return generateListReport(feeTypeRepository.findAll(), "Fee Types", format, FeeType.class);
            // Academic Reports
            case "ALL_STUDENTS":
                return generateAllStudentsReport(format, filters);
            case "ALL_GRADES":
                return generateAllGradesReport(format, filters);
            case "ALL_ENROLLMENTS":
                return generateListReport(enrollmentRepository.findAll(), "All Enrollments", format, Enrollment.class);
            case "ALL_SUBJECTS":
                return generateListReport(subjectRepository.findAll(), "All Subjects", format, Subject.class);
            case "ALL_TIMETABLES":
                return generateListReport(timetableRepository.findAll(), "All Timetables", format, Timetable.class);
            // Staff & HR Reports
            case "ALL_STAFF":
                return generateAllStaffReport(format, filters);
            case "ALL_STAFF_ATTENDANCE":
                return generateListReport(staffAttendanceRepository.findAll(), "Staff Attendance", format, StaffAttendance.class);
            case "ALL_LEAVE_REQUESTS":
                return generateListReport(leaveRequestRepository.findAll(), "Leave Requests", format, LeaveRequest.class);
            // Library Reports
            case "ALL_BOOKS":
                return generateListReport(bookRepository.findAll(), "Library Books", format, Book.class);
            case "ALL_BOOK_TRANSACTIONS":
                return generateListReport(bookTransactionRepository.findAll(), "Book Transactions", format, BookTransaction.class);
            // Administrative Reports
            case "ALL_USERS":
                return generateListReport(userRepository.findAll(), "System Users", format, User.class);
            case "ALL_AUDIT_LOGS":
                return generateListReport(auditLogRepository.findAll(), "Audit Logs", format, AuditLog.class);
            case "ALL_FACILITIES":
                return generateListReport(facilityRepository.findAll(), "All Facilities", format, Facility.class);
            default:
                throw new IllegalArgumentException("Invalid report type specified: " + reportType);
        }
    }

    // --- HELPER METHOD TO LOAD AND ENCODE IMAGES ---
    private String getImageAsBase64(String imagePath) throws IOException {
        ClassPathResource resource = new ClassPathResource(imagePath);
        if (!resource.exists()) {
            System.err.println("Warning: Image not found at path: " + imagePath);
            return "";
        }
        byte[] imageBytes = StreamUtils.copyToByteArray(resource.getInputStream());
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    // --- REPORT GENERATION LOGIC ---

    private ByteArrayInputStream generateFinancialStatement(String format, Map<String, String> filters) throws IOException {
        String studentId = filters.get("studentId");
        String academicYear = filters.get("academicYear");
        String semester = filters.get("semester");
        String currencyStr = filters.get("currency");

        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        List<FinancialLedger> entries = ledgerRepository.findFilteredLedgerForStudent(
                student.getId(), academicYear, semester, Currency.valueOf(currencyStr)
        );

        if ("PDF".equalsIgnoreCase(format)) {
            return createStudentStatementPdf(student, entries, currencyStr, academicYear, semester);
        }
        if ("XLSX".equalsIgnoreCase(format)) {
            return createStudentStatementExcel(entries);
        }
        if ("CSV".equalsIgnoreCase(format)) {
            return createStudentStatementCsv(entries);
        }
        throw new IllegalArgumentException("Unsupported format for financial statement: " + format);
    }

    private ByteArrayInputStream generateAllStudentsReport(String format, Map<String, String> filters) throws IOException {
        String grade = filters.getOrDefault("grade", "All");
        String section = filters.getOrDefault("section", "All");
        List<Student> students = studentRepository.findWithFilters(grade, section);
        return generateListReport(students, "Student List", format, Student.class);
    }

    private ByteArrayInputStream generateAllStaffReport(String format, Map<String, String> filters) throws IOException {
        String department = filters.getOrDefault("department", "All");
        String status = filters.getOrDefault("status", "All");
        List<Staff> staff = staffRepository.findWithFilters(department, status);
        return generateListReport(staff, "Staff List", format, Staff.class);
    }

    private ByteArrayInputStream generateFinancialSummaryReport(TransactionType type, String format, Map<String, String> filters) throws IOException {
        String grade = filters.get("grade");
        Long feeTypeId = filters.get("feeTypeId") != null && !filters.get("feeTypeId").isEmpty() ? Long.parseLong(filters.get("feeTypeId")) : null;
        LocalDate startDate = filters.get("startDate") != null && !filters.get("startDate").isEmpty() ? LocalDate.parse(filters.get("startDate")) : null;
        LocalDate endDate = filters.get("endDate") != null && !filters.get("endDate").isEmpty() ? LocalDate.parse(filters.get("endDate")) : null;

        List<FinancialLedger> financials = ledgerRepository.findFinancialsWithFilters(type, grade, feeTypeId, startDate, endDate);
        String title = (type == TransactionType.CREDIT ? "Payments" : "Charges") + " Summary";
        String[] headers = {"Date", "Student ID", "Student Name", "Grade", "Description", "Fee Type", "Currency", "Amount"};

        if ("XLSX".equalsIgnoreCase(format)) {
            return createFinancialSummaryExcel(financials, title, headers);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return createFinancialSummaryCsv(financials, headers);
        }
        throw new IllegalArgumentException("Unsupported format for financial summary: " + format);
    }

    private ByteArrayInputStream generateAllGradesReport(String format, Map<String, String> filters) throws IOException {
        List<Grade> grades = gradeRepository.findAll();
        String[] headers = {"Grade ID", "Student ID", "Student Name", "Subject Code", "Subject Name", "Academic Year", "Semester", "GPA/Score", "Letter Grade", "Assessment Type"};
        if ("XLSX".equalsIgnoreCase(format)) return createGradesExcel(grades, headers);
        if ("CSV".equalsIgnoreCase(format)) return createGradesCsv(grades, headers);
        throw new IllegalArgumentException("Unsupported format for grades report: " + format);
    }

    // --- GENERIC LIST REPORTING ---
    private <T> ByteArrayInputStream generateListReport(List<T> data, String title, String format, Class<T> clazz) throws IOException {
        String[] headers = getHeadersForClass(clazz);
        if ("XLSX".equalsIgnoreCase(format)) return createExcelForList(data, title, headers, clazz);
        if ("CSV".equalsIgnoreCase(format)) return createCsvForList(data, headers, clazz);
        throw new IllegalArgumentException("Unsupported format for list report: " + format);
    }

    // --- FORMAT-SPECIFIC HELPERS (PDF, EXCEL, CSV) ---

    private ByteArrayInputStream createStudentStatementPdf(Student student, List<FinancialLedger> ledger, String currency, String year, String semester) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String logoBase64 = "data:image/png;base64," + getImageAsBase64("static/images/logo.png");
        String estampBase64 = "data:image/png;base64," + getImageAsBase64("static/images/estamp.png");

        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>")
                .append("body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }")
                .append("h1 { font-size: 18pt; color: #2c3e50; margin: 0; } h3 { font-size: 14pt; color: #34495e; margin-bottom: 20px; }")
                .append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }")
                .append("th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }")
                .append("th { background-color: #f2f2f2; }")
                .append(".header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }")
                .append(".header img.logo { max-width: 120px; max-height: 120px; margin-bottom: 10px; }")
                .append(".student-info { border: 1px solid #ccc; padding: 10px; margin-top: 20px; border-radius: 5px; background-color: #f9f9f9; }")
                .append(".summary { text-align: right; margin-top: 20px; font-size: 12pt; font-weight: bold; }")
                .append("td.currency { text-align: right; }")
                .append(".watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); z-index: -1000; font-size: 60pt; color: rgba(0, 0, 0, 0.07); font-weight: bold; text-align: center; pointer-events: none; }")
                .append(".footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #ccc; padding-top: 5px; }")
                .append(".estamp-container { position: absolute; bottom: 80px; right: 20px; }")
                .append(".estamp-container img { max-width: 100px; max-height: 100px; opacity: 0.9; }")
                .append("</style></head><body>")
                .append("<div class='watermark'>Pachedu Junior School</div>")
                .append("<div class='header'>")
                .append("<img src='").append(logoBase64).append("' class='logo' alt='School Logo' />")
                .append("<h1>Pachedu Junior School</h1>")
                .append("<h3>Student Financial Statement</h3>")
                .append("<p>Date Printed: ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))).append("</p>")
                .append("</div>")
                .append(buildStudentInfoHtml(student, year, semester, currency))
                .append(buildLedgerTableHtml(ledger))
                .append(buildSummaryHtml(ledger, currency))
                .append("<div class='estamp-container'><img src='").append(estampBase64).append("' alt='Official Stamp' /></div>")
                .append("<div class='footer'>")
                .append("Pachedu Junior School | 123 Education Lane, Harare, Zimbabwe<br/>")
                .append("Phone: +263 77 777 7777 | Email: accounts@pachedu.ac.zw")
                .append("</div>")
                .append("</body></html>");

        HtmlConverter.convertToPdf(html.toString(), new PdfWriter(outputStream));
        return new ByteArrayInputStream(outputStream.toByteArray());
    }

    private <T> ByteArrayInputStream createExcelForList(List<T> data, String sheetName, String[] headers, Class<T> clazz) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(sheetName);
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);
            int rowNum = 1;
            for (T item : data) {
                Row row = sheet.createRow(rowNum++);
                String[] values = getValuesForClass(item, clazz);
                for (int i = 0; i < values.length; i++) row.createCell(i).setCellValue(values[i]);
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private <T> ByteArrayInputStream createCsvForList(List<T> data, String[] headers, Class<T> clazz) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(headers);
            for (T item : data) writer.writeNext(getValuesForClass(item, clazz));
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    // ... other specific excel/csv helpers ...

    // --- DATA MAPPING HELPERS (Headers & Values) ---
    private String[] getHeadersForClass(Class<?> clazz) {
        if (clazz == Student.class) return new String[]{"Student ID", "First Name", "Last Name", "Email", "Grade", "Section", "Enrollment Status"};
        if (clazz == Staff.class) return new String[]{"Employee ID", "First Name", "Last Name", "Email", "Department", "Position", "Hire Date", "Status"};
        if (clazz == Book.class) return new String[]{"Title", "Author", "ISBN", "Category", "Available Copies"};
        if (clazz == PaymentAlert.class) return new String[]{"Transaction Date", "Student Name", "Amount", "Currency", "Narrative", "Reference", "Status"};
        if (clazz == User.class) return new String[]{"User ID", "Username", "Email", "Roles", "Enabled"};
        if (clazz == FeeType.class) return new String[]{"ID", "Name", "Default Amount", "Currency", "Description"};
        if (clazz == AuditLog.class) return new String[]{"Timestamp", "Username", "Action", "Status", "IP Address", "Details"};
        if (clazz == Enrollment.class) return new String[]{"Student ID", "Academic Year", "Grade", "Section", "Enrollment Date", "Status"};
        if (clazz == BookTransaction.class) return new String[]{"Book Title", "Student Name", "Issue Date", "Due Date", "Return Date", "Status"};
        if (clazz == Subject.class) return new String[]{"Code", "Name", "Grade", "Description"};
        if (clazz == Timetable.class) return new String[]{"Academic Year", "Grade", "Section", "Day", "Start Time", "End Time", "Subject", "Teacher", "Room"};
        if (clazz == LeaveRequest.class) return new String[]{"Staff Name", "Leave Type", "Start Date", "End Date", "Status", "Reason"};
        if (clazz == StaffAttendance.class) return new String[]{"Staff Name", "Date", "Time In", "Time Out", "Status"};
        if (clazz == Facility.class) return new String[]{"Name", "Type", "Location", "Capacity", "Status"};
        return new String[]{};
    }

    private <T> String[] getValuesForClass(T item, Class<T> clazz) {
        if (clazz == Student.class) { Student s = (Student) item; return new String[]{s.getStudentId(), s.getFirstName(), s.getLastName(), s.getEmail(), s.getCurrentGrade(), s.getSection(), s.getEnrollmentStatus()}; }
        if (clazz == Staff.class) { Staff s = (Staff) item; return new String[]{s.getEmployeeId(), s.getFirstName(), s.getLastName(), s.getEmail(), s.getDepartment(), s.getPosition(), s.getHireDate().toString(), s.getEmploymentStatus()}; }
        if (clazz == Book.class) { Book b = (Book) item; return new String[]{b.getTitle(), b.getAuthor(), b.getIsbn(), b.getCategory(), String.valueOf(b.getAvailableCopies())}; }
        if (clazz == PaymentAlert.class) { PaymentAlert p = (PaymentAlert) item; return new String[]{p.getTransactionDate(), p.getStudentName(), p.getAmount().toString(), p.getCurrency(), p.getNarrative(), p.getReference(), p.getStatus()}; }
        if (clazz == User.class) { User u = (User) item; return new String[]{String.valueOf(u.getId()), u.getUsername(), u.getEmail(), u.getRoles().stream().map(Role::getName).collect(Collectors.joining(", ")), String.valueOf(u.isEnabled())}; }
        if (clazz == FeeType.class) { FeeType f = (FeeType) item; return new String[]{String.valueOf(f.getId()), f.getName(), f.getDefaultAmount().toString(), f.getCurrency().toString(), f.getDescription()}; }
        if (clazz == AuditLog.class) { AuditLog a = (AuditLog) item; return new String[]{a.getTimestamp().toString(), a.getUsername(), a.getAction(), a.getStatus(), a.getIpAddress(), a.getDetails()}; }
        if (clazz == Enrollment.class) { Enrollment e = (Enrollment) item; return new String[]{e.getStudent().getStudentId(), e.getAcademicYear(), e.getGrade(), e.getSection(), e.getEnrollmentDate().toString(), e.getEnrollmentStatus()}; }
        if (clazz == BookTransaction.class) { BookTransaction bt = (BookTransaction) item; return new String[]{bt.getBook().getTitle(), bt.getStudent().getFirstName() + " " + bt.getStudent().getLastName(), bt.getIssueDate().toString(), bt.getDueDate().toString(), bt.getReturnDate() != null ? bt.getReturnDate().toString() : "", bt.getStatus()}; }
        if (clazz == Subject.class) { Subject s = (Subject) item; return new String[]{s.getCode(), s.getName(), s.getGrade(), s.getDescription()}; }
        if (clazz == Timetable.class) { Timetable t = (Timetable) item; return new String[]{t.getAcademicYear(), t.getGrade(), t.getSection(), t.getDayOfWeek(), t.getStartTime().toString(), t.getEndTime().toString(), t.getSubject(), t.getTeacher() != null ? t.getTeacher().getUsername() : "N/A", t.getRoom()}; }
        if (clazz == LeaveRequest.class) { LeaveRequest lr = (LeaveRequest) item; return new String[]{lr.getStaff().getFirstName() + " " + lr.getStaff().getLastName(), lr.getLeaveType(), lr.getStartDate().toString(), lr.getEndDate().toString(), lr.getStatus(), lr.getReason()}; }
        if (clazz == StaffAttendance.class) { StaffAttendance sa = (StaffAttendance) item; return new String[]{sa.getStaff().getFirstName() + " " + sa.getStaff().getLastName(), sa.getAttendanceDate().toString(), sa.getTimeIn() != null ? sa.getTimeIn().toString() : "", sa.getTimeOut() != null ? sa.getTimeOut().toString() : "", sa.getStatus()}; }
        if (clazz == Facility.class) { Facility f = (Facility) item; return new String[]{f.getName(), f.getType(), f.getLocation(), String.valueOf(f.getCapacity()), f.getStatus()}; }
        return new String[]{};
    }

    // --- PDF TEMPLATE HELPERS ---
    private String buildStudentInfoHtml(Student student, String year, String semester, String currency) {
        return String.format("<div class='student-info'>" + "<b>Student Name:</b> %s %s<br/>" + "<b>Student ID:</b> %s<br/>" + "<b>Grade:</b> %s<br/>" + "<b>Statement for:</b> Year %s, %s<br/>" + "<b>Currency:</b> %s" + "</div>", student.getFirstName(), student.getLastName(), student.getStudentId(), student.getCurrentGrade(), year, semester, currency);
    }

    private String buildLedgerTableHtml(List<FinancialLedger> ledger) {
        StringBuilder tableHtml = new StringBuilder("<table><thead><tr><th>Date</th><th>Description</th><th style='text-align:right;'>Charge (Debit)</th><th style='text-align:right;'>Payment (Credit)</th><th style='text-align:right;'>Balance</th></tr></thead><tbody>");
        BigDecimal runningBalance = BigDecimal.ZERO;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (FinancialLedger entry : ledger) {
            BigDecimal debit = (entry.getTransactionType() == TransactionType.DEBIT) ? entry.getAmount() : BigDecimal.ZERO;
            BigDecimal credit = (entry.getTransactionType() == TransactionType.CREDIT) ? entry.getAmount() : BigDecimal.ZERO;
            runningBalance = runningBalance.add(debit).subtract(credit);
            tableHtml.append(String.format("<tr><td>%s</td><td>%s</td><td class='currency'>%s</td><td class='currency'>%s</td><td class='currency'>%.2f</td></tr>", entry.getTransactionDate().format(dateFormatter), entry.getDescription(), debit.compareTo(BigDecimal.ZERO) > 0 ? String.format("%.2f", debit) : "-", credit.compareTo(BigDecimal.ZERO) > 0 ? String.format("%.2f", credit) : "-", runningBalance));
        }
        tableHtml.append("</tbody></table>");
        return tableHtml.toString();
    }

    private String buildSummaryHtml(List<FinancialLedger> ledger, String currency) {
        BigDecimal finalBalance = ledger.stream().map(e -> e.getTransactionType() == TransactionType.DEBIT ? e.getAmount() : e.getAmount().negate()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return String.format("<div class='summary'>Closing Balance: %s %.2f</div>", currency, finalBalance);
    }

    // ... Other helpers like createGradesExcel, createStudentStatementCsv, etc.
    private ByteArrayInputStream createStudentStatementExcel(List<FinancialLedger> ledger) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Financial Statement");
            String[] headers = {"Date", "Description", "Charge (Debit)", "Payment (Credit)", "Balance"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);

            int rowNum = 1;
            BigDecimal balance = BigDecimal.ZERO;
            for (FinancialLedger entry : ledger) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getTransactionDate().toString());
                row.createCell(1).setCellValue(entry.getDescription());
                if (entry.getTransactionType() == TransactionType.DEBIT) {
                    balance = balance.add(entry.getAmount());
                    row.createCell(2).setCellValue(entry.getAmount().doubleValue());
                } else {
                    balance = balance.subtract(entry.getAmount());
                    row.createCell(3).setCellValue(entry.getAmount().doubleValue());
                }
                row.createCell(4).setCellValue(balance.doubleValue());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private ByteArrayInputStream createStudentStatementCsv(List<FinancialLedger> ledger) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(new String[]{"Date", "Description", "Charge_Debit", "Payment_Credit", "Balance"});
            BigDecimal balance = BigDecimal.ZERO;
            for (FinancialLedger entry : ledger) {
                if (entry.getTransactionType() == TransactionType.DEBIT) {
                    balance = balance.add(entry.getAmount());
                    writer.writeNext(new String[]{entry.getTransactionDate().toString(), entry.getDescription(), entry.getAmount().toString(), "", balance.toString()});
                } else {
                    balance = balance.subtract(entry.getAmount());
                    writer.writeNext(new String[]{entry.getTransactionDate().toString(), entry.getDescription(), "", entry.getAmount().toString(), balance.toString()});
                }
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private ByteArrayInputStream createFinancialSummaryExcel(List<FinancialLedger> financials, String title, String[] headers) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(title);
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);

            int rowNum = 1;
            for (FinancialLedger entry : financials) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getTransactionDate().toString());
                row.createCell(1).setCellValue(entry.getStudent().getStudentId());
                row.createCell(2).setCellValue(entry.getStudent().getFirstName() + " " + entry.getStudent().getLastName());
                row.createCell(3).setCellValue(entry.getStudent().getCurrentGrade());
                row.createCell(4).setCellValue(entry.getDescription());
                row.createCell(5).setCellValue(entry.getFeeType() != null ? entry.getFeeType().getName() : "N/A");
                row.createCell(6).setCellValue(entry.getCurrency().toString());
                row.createCell(7).setCellValue(entry.getAmount().doubleValue());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private ByteArrayInputStream createFinancialSummaryCsv(List<FinancialLedger> financials, String[] headers) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(headers);
            for (FinancialLedger entry : financials) {
                writer.writeNext(new String[]{
                        entry.getTransactionDate().toString(),
                        entry.getStudent().getStudentId(),
                        entry.getStudent().getFirstName() + " " + entry.getStudent().getLastName(),
                        entry.getStudent().getCurrentGrade(),
                        entry.getDescription(),
                        entry.getFeeType() != null ? entry.getFeeType().getName() : "N/A",
                        entry.getCurrency().toString(),
                        entry.getAmount().toString()
                });
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private ByteArrayInputStream createGradesExcel(List<Grade> grades, String[] headers) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("All Grades");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);
            int rowNum = 1;
            for (Grade grade : grades) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(grade.getId());
                row.createCell(1).setCellValue(grade.getStudent() != null ? grade.getStudent().getStudentId() : "N/A");
                row.createCell(2).setCellValue(grade.getStudent() != null ? grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName() : "N/A");
                row.createCell(3).setCellValue(grade.getSubject() != null ? grade.getSubject().getCode() : "N/A");
                row.createCell(4).setCellValue(grade.getSubject() != null ? grade.getSubject().getName() : "N/A");
                row.createCell(5).setCellValue(grade.getAcademicYear());
                row.createCell(6).setCellValue(grade.getSemester());
                row.createCell(7).setCellValue(grade.getGpa() != null ? grade.getGpa().doubleValue() : 0.0);
                row.createCell(8).setCellValue(grade.getLetterGrade());
                row.createCell(9).setCellValue(grade.getAssessmentType());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private ByteArrayInputStream createGradesCsv(List<Grade> grades, String[] headers) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(headers);
            for (Grade grade : grades) {
                writer.writeNext(new String[]{
                        String.valueOf(grade.getId()),
                        grade.getStudent() != null ? grade.getStudent().getStudentId() : "N/A",
                        grade.getStudent() != null ? grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName() : "N/A",
                        grade.getSubject() != null ? grade.getSubject().getCode() : "N/A",
                        grade.getSubject() != null ? grade.getSubject().getName() : "N/A",
                        grade.getAcademicYear(),
                        grade.getSemester(),
                        grade.getGpa() != null ? grade.getGpa().toString() : "",
                        grade.getLetterGrade(),
                        grade.getAssessmentType()
                });
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    // --- NEW PUBLIC METHOD FOR PREVIEW GENERATION ---
    public Map<String, Object> generatePreview(String reportType, Map<String, String> filters) {
        List<?> data;
        String[] headers;
        Class<?> clazz;

        switch (reportType) {
            case "FINANCIAL_STATEMENT":
                Student student = studentRepository.findByStudentId(filters.get("studentId")).orElseThrow(() -> new RuntimeException("Student not found"));
                data = ledgerRepository.findFilteredLedgerForStudent(student.getId(), filters.get("academicYear"), filters.get("semester"), Currency.valueOf(filters.get("currency")));
                headers = new String[]{"Date", "Description", "Charge", "Payment", "Currency"};
                clazz = FinancialLedger.class;
                break;
            case "FINANCIAL_SUMMARY_PAYMENTS":
                data = findFinancialsWithFilters(TransactionType.CREDIT, filters);
                headers = new String[]{"Date", "Student Name", "Grade", "Description", "Amount", "Currency"};
                clazz = FinancialLedger.class;
                break;
            case "FINANCIAL_SUMMARY_CHARGES":
                data = findFinancialsWithFilters(TransactionType.DEBIT, filters);
                headers = new String[]{"Date", "Student Name", "Grade", "Description", "Amount", "Currency"};
                clazz = FinancialLedger.class;
                break;
            case "ALL_STUDENTS":
                data = studentRepository.findWithFilters(filters.getOrDefault("grade", "All"), filters.getOrDefault("section", "All"));
                headers = getHeadersForClass(Student.class);
                clazz = Student.class;
                break;
            case "ALL_STAFF":
                data = staffRepository.findWithFilters(filters.getOrDefault("department", "All"), filters.getOrDefault("status", "All"));
                headers = getHeadersForClass(Staff.class);
                clazz = Staff.class;
                break;
            case "ALL_GRADES":
                data = gradeRepository.findAll();
                headers = getHeadersForClass(Grade.class);
                clazz = Grade.class;
                break;
            default: // Handles all simple list reports
                data = getFullDataForReport(reportType);
                clazz = getClassForReportType(reportType);
                headers = getHeadersForClass(clazz);
        }

        List<?> previewData = data.stream().limit(10).collect(Collectors.toList());

        // The cast `(Class<Object>)` is removed from here as it's no longer needed
        List<List<String>> rows = previewData.stream()
                .map(item -> Arrays.asList(getValuesForPreview(item, item.getClass())))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("headers", headers);
        result.put("rows", rows);
        return result;
    }

    // Helper to reuse filter logic for financial summaries
    private List<FinancialLedger> findFinancialsWithFilters(TransactionType type, Map<String, String> filters) {
        String grade = filters.get("grade");
        Long feeTypeId = filters.get("feeTypeId") != null && !filters.get("feeTypeId").isEmpty() ? Long.parseLong(filters.get("feeTypeId")) : null;
        LocalDate startDate = filters.get("startDate") != null && !filters.get("startDate").isEmpty() ? LocalDate.parse(filters.get("startDate")) : null;
        LocalDate endDate = filters.get("endDate") != null && !filters.get("endDate").isEmpty() ? LocalDate.parse(filters.get("endDate")) : null;
        return ledgerRepository.findFinancialsWithFilters(type, grade, feeTypeId, startDate, endDate);
    }

    // Helper to get raw data for simple reports
    private List<?> getFullDataForReport(String reportType) {
        switch(reportType) {
            case "ALL_STAFF": return staffRepository.findAll();
            case "ALL_BOOKS": return bookRepository.findAll();
            case "PAYMENT_ALERTS": return paymentRepository.findAll();
            case "ALL_FEE_TYPES": return feeTypeRepository.findAll();
            case "ALL_ENROLLMENTS": return enrollmentRepository.findAll();
            case "ALL_SUBJECTS": return subjectRepository.findAll();
            case "ALL_TIMETABLES": return timetableRepository.findAll();
            case "ALL_STAFF_ATTENDANCE": return staffAttendanceRepository.findAll();
            case "ALL_LEAVE_REQUESTS": return leaveRequestRepository.findAll();
            case "ALL_BOOK_TRANSACTIONS": return bookTransactionRepository.findAll();
            case "ALL_USERS": return userRepository.findAll();
            case "ALL_AUDIT_LOGS": return auditLogRepository.findAll();
            case "ALL_FACILITIES": return facilityRepository.findAll();
            default: return List.of();
        }
    }

    // Helper to get Class type from reportType string
    private String[] getValuesForPreview(Object item, Class<?> clazz) {
        // The `==` comparison is now valid because of the flexible `Class<?>` type
        if (clazz == FinancialLedger.class) {
            FinancialLedger fl = (FinancialLedger) item;
            String charge = fl.getTransactionType() == TransactionType.DEBIT ? fl.getAmount().toString() : "";
            String payment = fl.getTransactionType() == TransactionType.CREDIT ? fl.getAmount().toString() : "";
            return new String[]{
                    fl.getTransactionDate().toString(),
                    fl.getDescription(),
                    charge,
                    payment,
                    fl.getCurrency().toString()
            };
        }
        // Fallback to the main value getter for all other types
        return getValuesForClass(item, (Class<Object>) clazz); // Cast is safe here
    }

    private Class<?> getClassForReportType(String reportType) {
        switch(reportType) {
            case "ALL_STAFF": return Staff.class;
            case "ALL_BOOKS": return Book.class;
            case "PAYMENT_ALERTS": return PaymentAlert.class;
            case "ALL_FEE_TYPES": return FeeType.class;
            case "ALL_ENROLLMENTS": return Enrollment.class;
            case "ALL_SUBJECTS": return Subject.class;
            case "ALL_TIMETABLES": return Timetable.class;
            case "ALL_STAFF_ATTENDANCE": return StaffAttendance.class;
            case "ALL_LEAVE_REQUESTS": return LeaveRequest.class;
            case "ALL_BOOK_TRANSACTIONS": return BookTransaction.class;
            case "ALL_USERS": return User.class;
            case "ALL_AUDIT_LOGS": return AuditLog.class;
            case "ALL_FACILITIES": return Facility.class;
            default: return Object.class;
        }
    }

}
// src/main/java/com/payments/service/FinancialService.java

package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.LedgerEntryRequest;
import com.payments.dto.PaymentAllocationRequest;
import com.payments.dto.StudentBalanceDto;
import com.payments.model.*;
import com.payments.repository.FeeTypeRepository;
import com.payments.repository.FinancialLedgerRepository;
import com.payments.repository.PaymentRepository;
import com.payments.repository.StudentRepository;
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
import com.payments.dto.CurrencyBalanceDto;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinancialService {

    @Autowired private FeeTypeRepository feeTypeRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private SystemSettingsService settingsService;

    // --- Fee Type Management ---
    public List<FeeType> getAllFeeTypes() { return feeTypeRepository.findAll(); }
    public FeeType createFeeType(FeeType feeType) { return feeTypeRepository.save(feeType); }
    @Transactional
    public FeeType updateFeeType(Long id, FeeType feeTypeDetails) {
        FeeType feeType = feeTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("FeeType not found"));
        feeType.setName(feeTypeDetails.getName());
        feeType.setDefaultAmount(feeTypeDetails.getDefaultAmount());
        feeType.setDescription(feeTypeDetails.getDescription());
        feeType.setCurrency(feeTypeDetails.getCurrency());
        return feeTypeRepository.save(feeType);
    }
    @Transactional
    public void deleteFeeType(Long id) {
        if (!feeTypeRepository.existsById(id)) { throw new RuntimeException("FeeType not found"); }
        if (ledgerRepository.existsByFeeTypeId(id)) { throw new IllegalStateException("Cannot delete fee type: it is in use."); }
        feeTypeRepository.deleteById(id);
    }

    // --- Payment Allocation ---

    public List<PaymentAlert> getUnallocatedPayments() {
        return paymentRepository.findByStatus("PENDING");
    }

    public Page<PaymentAlert> getPaymentsByStatus(String status, String searchTerm, Pageable pageable) {
        return paymentRepository.findByStatusWithSearch(status, searchTerm, pageable);
    }


    @Transactional
    public FinancialLedger allocatePayment(PaymentAllocationRequest request) {
        PaymentAlert payment = paymentRepository.findById(request.getPaymentAlertId())
                .orElseThrow(() -> new RuntimeException("PaymentAlert not found"));
        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!"PENDING".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Payment already allocated.");
        }

        FinancialLedger creditEntry = new FinancialLedger();
        creditEntry.setStudent(student);
        creditEntry.setTransactionType(TransactionType.CREDIT);
        creditEntry.setAmount(payment.getAmount());
        creditEntry.setCurrency(Currency.valueOf(payment.getCurrency()));
        creditEntry.setDescription("Payment Received. Ref: " + payment.getReference());
        creditEntry.setTransactionDate(LocalDate.now());
        creditEntry.setPaymentAlertId(payment.getId());
        creditEntry.setAcademicYear(request.getAcademicYear());
        creditEntry.setSemester(request.getSemester());

        payment.setStatus("ALLOCATED");
        paymentRepository.save(payment);
        return ledgerRepository.save(creditEntry);
    }

    // --- THIS IS THE CORRECTED AND COMPLETE METHOD ---
    @Transactional
    public void applyBulkCharge(Long feeTypeId, List<String> studentIds, MultipartFile file, String academicYear, String semester, Long  categoryId)
            throws IOException, CsvValidationException {

        FeeType feeType = feeTypeRepository.findById(feeTypeId).orElseThrow(() -> new RuntimeException("FeeType not found"));


        // Step 1: Get the base list of students based on the category filter
        List<Student> studentsInCategory;
        if (categoryId == null || categoryId == 0) { // Using 0 as a convention for "ALL"
            studentsInCategory = studentRepository.findAll();
        } else {
            StudentCategory category = new StudentCategory();
            category.setId(categoryId);
            studentsInCategory = studentRepository.findByCategory(category);
        }

        // Step 2: Get the specific list of student IDs provided by the user (if any)
        List<String> providedStudentIds = new ArrayList<>();
        if (studentIds != null && !studentIds.isEmpty()) {
            providedStudentIds.addAll(studentIds);
        }
        if (file != null && !file.isEmpty()) {
            providedStudentIds.addAll(readStudentIdsFromFile(file));
        }

        // Step 3: Determine the final list of students to charge
        List<Student> studentsToCharge;
        if (providedStudentIds.isEmpty()) {
            // If no specific IDs are given, charge everyone in the selected category
            studentsToCharge = studentsInCategory;
        } else {
            // If specific IDs ARE given, charge only those students who are ALSO in the selected category
            final List<String> finalProvidedIds = providedStudentIds;
            studentsToCharge = studentsInCategory.stream()
                    .filter(student -> finalProvidedIds.contains(student.getStudentId()))
                    .collect(Collectors.toList());
        }

        if (studentsToCharge.isEmpty()) {
            throw new IllegalArgumentException("No students matched the specified category and ID list.");
        }

        // Step 4: Apply the charge to the final list of students
        for (Student student : studentsToCharge) {
            FinancialLedger charge = new FinancialLedger();
            charge.setStudent(student);
            charge.setFeeType(feeType);
            charge.setTransactionType(TransactionType.DEBIT);
            charge.setAmount(feeType.getDefaultAmount());
            charge.setDescription(feeType.getName());
            charge.setCurrency(feeType.getCurrency());
            charge.setTransactionDate(LocalDate.now());
            charge.setAcademicYear(academicYear);
            charge.setSemester(semester);
            ledgerRepository.save(charge);
        }
    }

    private List<String> readStudentIdsFromFile(MultipartFile file) throws IOException, CsvValidationException {
        List<String> studentIds = new ArrayList<>();
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();

        if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                csvReader.skip(1); // Skip header if present
                String[] line;
                while ((line = csvReader.readNext()) != null) {
                    if (line.length > 0 && !line[0].trim().isEmpty()) {
                        studentIds.add(line[0].trim());
                    }
                }
            }
        } else if (filename.endsWith(".xlsx")) {
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row != null) {
                        Cell cell = row.getCell(0);
                        if (cell != null) {
                            studentIds.add(getCellValueAsString(cell));
                        }
                    }
                }
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type. Please upload a .csv or .xlsx file.");
        }
        return studentIds;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return new java.text.DecimalFormat("0.##############").format(cell.getNumericCellValue()).trim();
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue()).trim();
            case FORMULA: return cell.getStringCellValue().trim();
            default: return "";
        }
    }

    // --- Individual Ledger Management ---
    @Transactional
    public FinancialLedger addCharge(LedgerEntryRequest request) {
        Student student = studentRepository.findByStudentId(request.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found"));
        FeeType feeType = null;
        if (request.getFeeTypeId() != null) {
            feeType = feeTypeRepository.findById(request.getFeeTypeId()).orElseThrow(() -> new RuntimeException("FeeType not found"));
        }
        FinancialLedger entry = new FinancialLedger();
        entry.setStudent(student);
        entry.setFeeType(feeType);
        entry.setTransactionType(TransactionType.DEBIT);
        entry.setAmount(request.getAmount());
        entry.setDescription(request.getDescription());
        entry.setTransactionDate(request.getTransactionDate());
        entry.setAcademicYear(request.getAcademicYear());
        entry.setSemester(request.getSemester());
        if (feeType != null) {
            entry.setCurrency(feeType.getCurrency());
        } else {
            entry.setCurrency(request.getCurrency() != null ? request.getCurrency() : Currency.USD);
        }
        return ledgerRepository.save(entry);
    }

    @Transactional
    public FinancialLedger addPayment(LedgerEntryRequest request) {
        Student student = studentRepository.findByStudentId(request.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found"));
        FinancialLedger entry = new FinancialLedger();
        entry.setStudent(student);
        entry.setTransactionType(TransactionType.CREDIT);
        entry.setAmount(request.getAmount());
        entry.setCurrency(request.getCurrency() != null ? request.getCurrency() : Currency.USD);
        entry.setDescription(request.getDescription());
        entry.setTransactionDate(request.getTransactionDate());
        entry.setAcademicYear(request.getAcademicYear());
        entry.setSemester(request.getSemester());
        return ledgerRepository.save(entry);
    }

    @Transactional
    public FinancialLedger updateLedgerEntry(Long id, LedgerEntryRequest request) {
        FinancialLedger entry = ledgerRepository.findById(id).orElseThrow(() -> new RuntimeException("Ledger entry not found"));
        entry.setAmount(request.getAmount());
        entry.setDescription(request.getDescription());
        entry.setTransactionDate(request.getTransactionDate());
        entry.setAcademicYear(request.getAcademicYear());
        entry.setSemester(request.getSemester());
        entry.setCurrency(request.getCurrency());
        if (entry.getTransactionType() == TransactionType.DEBIT && request.getFeeTypeId() != null) {
            FeeType feeType = feeTypeRepository.findById(request.getFeeTypeId()).orElseThrow(() -> new RuntimeException("FeeType not found"));
            entry.setFeeType(feeType);
        }
        return ledgerRepository.save(entry);
    }

    @Transactional
    public void deleteLedgerEntry(Long id) {
        FinancialLedger entry = ledgerRepository.findById(id).orElseThrow(() -> new RuntimeException("Ledger entry not found"));
        if (entry.getPaymentAlertId() != null) {
            paymentRepository.findById(entry.getPaymentAlertId()).ifPresent(paymentAlert -> {
                paymentAlert.setStatus("PENDING");
                paymentRepository.save(paymentAlert);
            });
        }
        ledgerRepository.delete(entry);
    }

    public List<FinancialLedger> getStudentLedger(String studentId, List<String> years, List<String> semesters) {
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        return ledgerRepository.findByStudentAndFilter(student.getId(), years, semesters);
    }

    public CurrencyBalanceDto getStudentBalance(String studentId) {
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        List<Map<String, Object>> results = ledgerRepository.getBalancesByCurrencyForStudent(student.getId());
        Map<String, BigDecimal> balances = results.stream().collect(Collectors.toMap(result -> result.get("currency").toString(), result -> (BigDecimal) result.get("balance")));
        return new CurrencyBalanceDto(balances);
    }

    public List<StudentBalanceDto> getAllStudentBalances() {
        List<StudentBalanceDto> studentDtos = studentRepository.findAllStudentInfoForBalanceDto();
        studentDtos.forEach(dto -> {
            CurrencyBalanceDto currencyBalance = this.getStudentBalance(dto.getStudentId());
            dto.setBalances(currencyBalance.getBalances());
        });
        return studentDtos;
    }
}
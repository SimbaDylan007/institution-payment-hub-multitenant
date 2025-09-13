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

        // --- THIS IS THE FIX ---
        // payment.getAmount() is already a BigDecimal, so just assign it directly.
        creditEntry.setAmount(payment.getAmount());

        // Use the currency from the payment alert itself
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


    @Transactional
    public void applyBulkCharge(Long feeTypeId, List<String> studentIds, MultipartFile file, String academicYear, String semester)
            throws IOException, CsvValidationException {

        FeeType feeType = feeTypeRepository.findById(feeTypeId)
                .orElseThrow(() -> new RuntimeException("FeeType not found"));

        List<String> allStudentIds = new ArrayList<>();
        if (studentIds != null && !studentIds.isEmpty()) {
            allStudentIds.addAll(studentIds);
        }

        // --- INTELLIGENT FILE READING LOGIC ---
        if (file != null && !file.isEmpty()) {
            String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();

            if (filename.endsWith(".csv")) {
                // --- CSV Reading Logic (your existing code) ---
                try (Reader reader = new InputStreamReader(file.getInputStream());
                     CSVReader csvReader = new CSVReader(reader)) {
                    csvReader.skip(1); // Skip header if present
                    String[] line;
                    while ((line = csvReader.readNext()) != null) {
                        if (line.length > 0 && !line[0].trim().isEmpty()) {
                            allStudentIds.add(line[0].trim());
                        }
                    }
                }
            } else if (filename.endsWith(".xlsx")) {
                // --- NEW: Excel Reading Logic ---
                try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                    Sheet sheet = workbook.getSheetAt(0);
                    for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Start from 1 to skip header
                        Row row = sheet.getRow(i);
                        if (row != null) {
                            Cell cell = row.getCell(0); // Get the first cell
                            if (cell != null) {
                                allStudentIds.add(getCellValueAsString(cell));
                            }
                        }
                    }
                }
            } else {
                throw new IllegalArgumentException("Unsupported file type. Please upload a .csv or .xlsx file.");
            }
        }

        if (allStudentIds.isEmpty()) {
            throw new IllegalArgumentException("No student IDs were provided for the bulk charge.");
        }

        // --- (The rest of the logic is the same) ---
        for (String studentId : allStudentIds) {
            studentRepository.findByStudentId(studentId.trim()).ifPresent(student -> {
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
            });
        }
    }

    // --- NEW: Helper method to safely read any cell type from Excel as a String ---
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // This handles both integers and decimals without adding ".0"
                return new java.text.DecimalFormat("0.##############").format(cell.getNumericCellValue()).trim();
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue()).trim();
            case FORMULA:
                // You might want to evaluate the formula, but for student IDs, getting the cached value is safer
                return cell.getStringCellValue().trim();
            default:
                return "";
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
        // Set currency from FeeType if available, otherwise from request, with a default
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

    // --- NEW: Update Ledger Entry Logic ---
    @Transactional
    public FinancialLedger updateLedgerEntry(Long id, LedgerEntryRequest request) {
        FinancialLedger entry = ledgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found"));

        // Update fields from the request
        entry.setAmount(request.getAmount());
        entry.setDescription(request.getDescription());
        entry.setTransactionDate(request.getTransactionDate());
        entry.setAcademicYear(request.getAcademicYear());
        entry.setSemester(request.getSemester());
        entry.setCurrency(request.getCurrency());

        // If it's a DEBIT, you can also update the fee type
        if (entry.getTransactionType() == TransactionType.DEBIT && request.getFeeTypeId() != null) {
            FeeType feeType = feeTypeRepository.findById(request.getFeeTypeId())
                    .orElseThrow(() -> new RuntimeException("FeeType not found"));
            entry.setFeeType(feeType);
        }

        return ledgerRepository.save(entry);
    }

    // --- NEW: Delete Ledger Entry Logic ---
    @Transactional
    public void deleteLedgerEntry(Long id) {
        FinancialLedger entry = ledgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found"));

        // If this entry was from an allocated payment, revert the payment alert status
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
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Map<String, Object>> results = ledgerRepository.getBalancesByCurrencyForStudent(student.getId());

        // Convert the list of maps into a single map of Currency -> Balance
        Map<String, BigDecimal> balances = results.stream()
                .collect(Collectors.toMap(
                        result -> result.get("currency").toString(),
                        result -> (BigDecimal) result.get("balance")
                ));

        return new CurrencyBalanceDto(balances);
    }

    public List<StudentBalanceDto> getAllStudentBalances() {
        // 1. Get the basic info for all students
        List<StudentBalanceDto> studentDtos = studentRepository.findAllStudentInfoForBalanceDto();

        // 2. For each student, fetch their multi-currency balance and attach it
        studentDtos.forEach(dto -> {
            CurrencyBalanceDto currencyBalance = this.getStudentBalance(dto.getStudentId());
            dto.setBalances(currencyBalance.getBalances());
        });

        return studentDtos;

    }
}
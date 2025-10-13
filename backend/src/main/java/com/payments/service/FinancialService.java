// src/main/java/com/payments/service/FinancialService.java

package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.*;
import com.payments.model.*;
import com.payments.repository.*;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class FinancialService {

    private static final Logger log = LoggerFactory.getLogger(FinancialService.class);


    @Autowired private FeeTypeRepository feeTypeRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private SystemSettingsService settingsService;
    @Autowired private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // --- Fee Type Management ---
    public List<FeeType> getAllFeeTypes() { return feeTypeRepository.findAll(); }
    public FeeType createFeeType(FeeType feeType) {
        // --- TENANCY ENFORCEMENT ---
        User currentUser = getCurrentUser();
        if (currentUser.getInstitution() == null && !isSuperAdmin(currentUser)) {
            throw new IllegalStateException("User does not belong to an institution.");
        }
        // Stamp the new FeeType with the user's institution
        feeType.setInstitution(currentUser.getInstitution());
        return feeTypeRepository.save(feeType);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("Authenticated user not found."));
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }

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
        // findById is automatically filtered.
        FeeType feeType = feeTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("FeeType not found"));
        // Check for usage WITHIN the same institution.
        if (ledgerRepository.existsByFeeTypeIdAndInstitution(id, feeType.getInstitution())) {
            throw new IllegalStateException("Cannot delete fee type: it is in use by ledger entries.");
        }
        feeTypeRepository.deleteById(id);
    }


    // --- Payment Allocation (Now Tenant-Aware) ---
    public List<PaymentAlert> getUnallocatedPayments() {
        // --- TENANCY ENFORCEMENT ---
        User currentUser = getCurrentUser();
        if (isSuperAdmin(currentUser)) {
            // Super-admins see all pending payments from all institutions
            return paymentRepository.findByStatus("PENDING");
        }
        if (currentUser.getInstitution() == null) return List.of(); // Non-admin with no institution sees nothing
        // Regular users only see pending payments for their own institution
        return paymentRepository.findByStatusAndInstitution("PENDING", currentUser.getInstitution());
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

        // --- Cross-Tenancy Check ---
        if (!Objects.equals(payment.getInstitution().getId(), student.getInstitution().getId())) {
            throw new SecurityException("Cannot allocate payment to a student from a different institution.");
        }

        if (!"PENDING".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Payment already allocated.");
        }

        FinancialLedger creditEntry = new FinancialLedger();
        creditEntry.setStudent(student);
        creditEntry.setInstitution(student.getInstitution());
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

        User currentUser = getCurrentUser();
        Institution targetInstitution = currentUser.getInstitution();
        if (targetInstitution == null) {
            throw new IllegalStateException("You must belong to an institution to apply bulk charges.");
        }

        FeeType feeType = feeTypeRepository.findById(feeTypeId).orElseThrow(() -> new RuntimeException("FeeType not found"));
        if (!Objects.equals(feeType.getInstitution().getId(), targetInstitution.getId())) {
            throw new SecurityException("Cannot apply a fee type from another institution.");
        }

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
            charge.setInstitution(targetInstitution);
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
        entry.setInstitution(student.getInstitution());
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
        // 1. Fetch the student. The Hibernate Filter automatically ensures the user
        //    can only access students from their own institution.
        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));

        // 2. Create the new ledger entry.
        FinancialLedger entry = new FinancialLedger();

        // --- CRITICAL TENANCY ENFORCEMENT ---
        // 3. Explicitly set the institution from the verified student object.
        entry.setInstitution(student.getInstitution());

        entry.setStudent(student);
        entry.setTransactionType(TransactionType.CREDIT);
        entry.setAmount(request.getAmount());
        entry.setCurrency(request.getCurrency() != null ? request.getCurrency() : Currency.USD); // Default currency
        entry.setDescription(request.getDescription());
        entry.setTransactionDate(request.getTransactionDate());
        entry.setAcademicYear(request.getAcademicYear());
        entry.setSemester(request.getSemester());

        // 4. Save the new, tenant-stamped entry.
        return ledgerRepository.save(entry);
    }

    @Transactional
    public FinancialLedger updateLedgerEntry(Long id, LedgerEntryRequest request) {
        // 1. Fetch the existing ledger entry. The Hibernate Filter automatically ensures
        //    a user can only fetch an entry from their own institution.
        FinancialLedger existingEntry = ledgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found with id: " + id));

        // --- (Optional but Recommended) Security Check for FeeType ---
        if (existingEntry.getTransactionType() == TransactionType.DEBIT && request.getFeeTypeId() != null) {
            // Fetch the FeeType to be assigned. This findById is also automatically filtered.
            FeeType feeType = feeTypeRepository.findById(request.getFeeTypeId())
                    .orElseThrow(() -> new RuntimeException("FeeType not found with id: " + request.getFeeTypeId()));

            // This check prevents assigning a FeeType from a different institution.
            // The filter on findById makes this redundant but adds an explicit layer of security.
            if (!Objects.equals(feeType.getInstitution().getId(), existingEntry.getInstitution().getId())) {
                throw new SecurityException("Cannot assign a FeeType from a different institution.");
            }
            existingEntry.setFeeType(feeType);
        } else {
            // If it's a payment (CREDIT) or no fee type is provided, ensure it's set to null.
            existingEntry.setFeeType(null);
        }
        // --- End Security Check ---

        // 2. Update the properties of the existing entry.
        // We do NOT update the student or institution, as this should be a separate business process.
        existingEntry.setAmount(request.getAmount());
        existingEntry.setDescription(request.getDescription());
        existingEntry.setTransactionDate(request.getTransactionDate());
        existingEntry.setAcademicYear(request.getAcademicYear());
        existingEntry.setSemester(request.getSemester());
        existingEntry.setCurrency(request.getCurrency());

        // 3. Save the updated entry.
        return ledgerRepository.save(existingEntry);
    }

    @Transactional
    public void deleteLedgerEntry(Long id) {
        // 1. Fetch the ledger entry. The Hibernate Filter ensures the user can only access
        //    entries from their own institution. If not found, it throws an exception.
        FinancialLedger entry = ledgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found with id: " + id));

        // 2. Check if this ledger entry is linked to a payment alert.
        String paymentAlertId = entry.getPaymentAlertId();
        if (paymentAlertId != null && !paymentAlertId.isBlank()) {

            // 3. Fetch the associated payment alert.
            paymentRepository.findById(paymentAlertId).ifPresent(paymentAlert -> {

                // --- CRITICAL SECURITY CHECK ---
                // 4. Verify that the payment alert belongs to the SAME institution
                //    as the ledger entry we are deleting.
                if (Objects.equals(paymentAlert.getInstitution().getId(), entry.getInstitution().getId())) {

                    // 5. If they match, reset the payment alert's status.
                    paymentAlert.setStatus("PENDING");
                    paymentRepository.save(paymentAlert);

                } else {
                    // This case should be rare but is a critical security boundary.
                    // It indicates a potential data integrity issue.
                    log.error("SECURITY ALERT: Attempted to modify PaymentAlert ID {} from Institution {} " +
                                    "while deleting LedgerEntry ID {} from Institution {}. Operation aborted.",
                            paymentAlert.getId(), paymentAlert.getInstitution().getId(),
                            entry.getId(), entry.getInstitution().getId());
                    // We do not modify the paymentAlert from the wrong institution.
                }
            });
        }

        // 6. Finally, delete the ledger entry itself.
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
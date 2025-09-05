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

@Service
public class FinancialService {

    @Autowired private FeeTypeRepository feeTypeRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PaymentRepository paymentRepository;

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
        PaymentAlert payment = paymentRepository.findById(request.getPaymentAlertId()).orElseThrow(() -> new RuntimeException("PaymentAlert not found"));
        Student student = studentRepository.findByStudentId(request.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found"));
        if (!"PENDING".equalsIgnoreCase(payment.getStatus())) { throw new IllegalStateException("Payment already allocated."); }
        FinancialLedger creditEntry = new FinancialLedger();
        creditEntry.setStudent(student);
        creditEntry.setTransactionType(TransactionType.CREDIT);
        creditEntry.setAmount(BigDecimal.valueOf(payment.getAmount()));
        creditEntry.setCurrency(Currency.USD); // Defaulting
        creditEntry.setDescription("Payment Received. Ref: " + payment.getReference());
        creditEntry.setTransactionDate(LocalDate.now());
        creditEntry.setPaymentAlertId(payment.getId());
        payment.setStatus("ALLOCATED");
        paymentRepository.save(payment);
        return ledgerRepository.save(creditEntry);
    }

    // --- Bulk Charging ---
    @Transactional
    public void applyBulkCharge(Long feeTypeId, List<String> studentIds, MultipartFile studentIdFile) throws IOException, CsvValidationException {
        FeeType feeType = feeTypeRepository.findById(feeTypeId).orElseThrow(() -> new RuntimeException("FeeType not found"));
        List<String> allStudentIds = new ArrayList<>();
        if (studentIds != null && !studentIds.isEmpty()) { allStudentIds.addAll(studentIds); }
        if (studentIdFile != null && !studentIdFile.isEmpty()) {
            try (Reader reader = new InputStreamReader(studentIdFile.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                String[] line;
                while ((line = csvReader.readNext()) != null) { if (line.length > 0 && !line[0].trim().isEmpty()) { allStudentIds.add(line[0]); } }
            }
        }
        if (allStudentIds.isEmpty()) { throw new IllegalArgumentException("No student IDs provided for bulk charge."); }
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
                ledgerRepository.save(charge);
            });
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
        if (feeType != null) { entry.setCurrency(feeType.getCurrency()); }
        else { entry.setCurrency(Currency.USD); } // Default currency
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

    public List<FinancialLedger> getStudentLedger(String studentId, List<String> years, List<String> semesters) {
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        return ledgerRepository.findByStudentAndFilter(student.getId(), years, semesters);
    }

    public BigDecimal getStudentBalance(String studentId) {
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        return ledgerRepository.getBalanceForStudent(student.getId());
    }

    public List<StudentBalanceDto> getAllStudentBalances() {
        return studentRepository.findAllWithBalance();
    }
}
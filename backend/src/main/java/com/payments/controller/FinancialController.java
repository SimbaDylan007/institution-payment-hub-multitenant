package com.payments.controller;

import com.payments.dto.LedgerEntryRequest;
import com.payments.model.FeeType;
import com.payments.model.FinancialLedger;
import com.payments.service.FinancialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.payments.dto.StudentBalanceDto;
import com.payments.model.PaymentAlert;
import com.payments.dto.PaymentAllocationRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import com.opencsv.exceptions.CsvValidationException;
import java.io.IOException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import com.payments.dto.CurrencyBalanceDto;

@RestController
@RequestMapping("/api/financials")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_ADMIN')") // Only ADMIN and FINANCE_ADMIN can access
public class FinancialController {

    @Autowired private FinancialService financialService;

    // --- Fee Type Endpoints ---
    @GetMapping("/fee-types")
    public ResponseEntity<List<FeeType>> getAllFeeTypes() {
        return ResponseEntity.ok(financialService.getAllFeeTypes());
    }

    @PostMapping("/fee-types")
    public ResponseEntity<FeeType> createFeeType(@RequestBody FeeType feeType) {
        return ResponseEntity.ok(financialService.createFeeType(feeType));
    }

    // --- Student Ledger Endpoints ---
    @GetMapping("/students/{studentId}/ledger")
    public ResponseEntity<List<FinancialLedger>> getStudentLedger(
            @PathVariable String studentId,
            @RequestParam(required = false) List<String> years,
            @RequestParam(required = false) List<String> semesters) {
        return ResponseEntity.ok(financialService.getStudentLedger(studentId, years, semesters));
    }


    @GetMapping("/students/{studentId}/balance")
    public ResponseEntity<CurrencyBalanceDto> getStudentBalance(@PathVariable String studentId) {
        CurrencyBalanceDto balance = financialService.getStudentBalance(studentId);
        return ResponseEntity.ok(balance);
    }

    @PostMapping("/students/charges")
    public ResponseEntity<FinancialLedger> addCharge(@RequestBody LedgerEntryRequest request) {
        return ResponseEntity.ok(financialService.addCharge(request));
    }

    @PostMapping("/students/payments")
    public ResponseEntity<FinancialLedger> addPayment(@RequestBody LedgerEntryRequest request) {
        return ResponseEntity.ok(financialService.addPayment(request));
    }

    @GetMapping("/students/balances")
    public ResponseEntity<List<StudentBalanceDto>> getAllStudentBalances() {
        return ResponseEntity.ok(financialService.getAllStudentBalances());
    }

    @PutMapping("/fee-types/{id}")
    public ResponseEntity<FeeType> updateFeeType(@PathVariable Long id, @RequestBody FeeType feeTypeDetails) {
        return ResponseEntity.ok(financialService.updateFeeType(id, feeTypeDetails));
    }

    @DeleteMapping("/fee-types/{id}")
    public ResponseEntity<Void> deleteFeeType(@PathVariable Long id) {
        financialService.deleteFeeType(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/payments/unallocated")
    public ResponseEntity<List<PaymentAlert>> getUnallocatedPayments() {
        return ResponseEntity.ok(financialService.getUnallocatedPayments());
    }

    @PostMapping("/payments/allocate")
    public ResponseEntity<FinancialLedger> allocatePayment(@RequestBody PaymentAllocationRequest request) {
        return ResponseEntity.ok(financialService.allocatePayment(request));
    }

    @PostMapping("/charges/bulk")
    public ResponseEntity<Void> applyBulkCharge(
            @RequestParam("feeTypeId") Long feeTypeId,
            @RequestParam("academicYear") String academicYear, // <-- Add new parameter
            @RequestParam("semester") String semester,         // <-- Add new parameter
            @RequestParam(value = "studentIds", required = false) List<String> studentIds,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException, CsvValidationException {

        financialService.applyBulkCharge(feeTypeId, studentIds, file, academicYear, semester);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/payments/status")
    public ResponseEntity<Page<PaymentAlert>> getPaymentsByStatus(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "") String searchTerm,
            Pageable pageable) {
        return ResponseEntity.ok(financialService.getPaymentsByStatus(status, searchTerm, pageable));
    }

}
package com.payments.service;

import com.payments.model.*;
import com.payments.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ReconciliationService {

    private static final Logger logger = LoggerFactory.getLogger(ReconciliationService.class);

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private SystemSettingsService settingsService; // Inject settings service


    @Scheduled(fixedRateString = "${reconciliation.job.fixedRate:300000}")
    @Transactional
    public void runAutoReconciliation() {
        logger.info("Starting automatic payment reconciliation job...");
        List<PaymentAlert> pendingPayments = paymentRepository.findByStatus("PENDING");

        if (pendingPayments.isEmpty()) {
            logger.info("No pending payments to reconcile.");
            return;
        }

        // Get the current system settings once for the entire job
        SystemSettings currentSettings = settingsService.getSystemSettings();

        for (PaymentAlert payment : pendingPayments) {
            Optional<Student> studentOpt = studentRepository.findByStudentId(payment.getRegNumber());

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                logger.info("Auto-allocating payment {} to student {}", payment.getId(), student.getStudentId());

                FinancialLedger creditEntry = new FinancialLedger();
                creditEntry.setStudent(student);
                creditEntry.setTransactionType(TransactionType.CREDIT);

                // --- THIS IS THE FIX ---
                // payment.getAmount() is already a BigDecimal. No conversion needed.
                creditEntry.setAmount(payment.getAmount());

                // Use the currency from the payment alert.
                creditEntry.setCurrency(Currency.valueOf(payment.getCurrency()));
                creditEntry.setDescription("Auto-Allocated Payment. Ref: " + payment.getReference());
                creditEntry.setTransactionDate(LocalDate.now());
                creditEntry.setPaymentAlertId(payment.getId());

                // Apply the dynamically fetched academic period
                creditEntry.setAcademicYear(currentSettings.getCurrentAcademicYear());
                creditEntry.setSemester(currentSettings.getCurrentSemester());

                ledgerRepository.save(creditEntry);

                payment.setStatus("AUTO_ALLOCATED");
                paymentRepository.save(payment);
            } else {
                logger.warn("Could not find student with ID {} for payment {}. Manual allocation required.", payment.getRegNumber(), payment.getId());
            }
        }
        logger.info("Finished automatic payment reconciliation job. Processed {} payments.", pendingPayments.size());
    }
}
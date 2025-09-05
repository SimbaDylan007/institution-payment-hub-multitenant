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

    // This method will run automatically every 5 minutes.
    // The rate can be adjusted via application.properties.
    @Scheduled(fixedRateString = "${reconciliation.job.fixedRate:300000}")
    @Transactional
    public void runAutoReconciliation() {
        logger.info("Starting automatic payment reconciliation job...");
        List<PaymentAlert> pendingPayments = paymentRepository.findByStatus("PENDING");

        for (PaymentAlert payment : pendingPayments) {
            // Try to find a student using the regNumber from the payment alert
            Optional<Student> studentOpt = studentRepository.findByStudentId(payment.getRegNumber());

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                BigDecimal currentBalance = ledgerRepository.getBalanceForStudent(student.getId());

                // Simple auto-allocation rule: if the student has an outstanding balance.
                if (currentBalance.compareTo(BigDecimal.ZERO) > 0) {
                    logger.info("Auto-allocating payment {} to student {}", payment.getId(), student.getStudentId());

                    // Create the credit entry in the ledger
                    FinancialLedger creditEntry = new FinancialLedger();
                    creditEntry.setStudent(student);
                    creditEntry.setTransactionType(TransactionType.CREDIT);
                    creditEntry.setAmount(BigDecimal.valueOf(payment.getAmount()));
                    creditEntry.setCurrency(Currency.USD); // Defaulting to USD
                    creditEntry.setDescription("Auto-Allocated Payment. Ref: " + payment.getReference());
                    creditEntry.setTransactionDate(LocalDate.now());
                    creditEntry.setPaymentAlertId(payment.getId());
                    ledgerRepository.save(creditEntry);

                    // Mark the payment as allocated
                    payment.setStatus("AUTO_ALLOCATED");
                    paymentRepository.save(payment);
                } else {
                    logger.warn("Payment {} for student {} found, but student has no outstanding balance. Skipping.", payment.getId(), student.getStudentId());
                }
            } else {
                logger.warn("Could not find student with ID {} for payment {}. Manual allocation required.", payment.getRegNumber(), payment.getId());
            }
        }
        logger.info("Finished automatic payment reconciliation job. Processed {} payments.", pendingPayments.size());
    }
}
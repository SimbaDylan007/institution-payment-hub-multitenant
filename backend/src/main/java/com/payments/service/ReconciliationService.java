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
            Optional<Student> studentOpt = studentRepository.findByStudentId(payment.getRegNumber());

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();

                // --- THIS IS THE MODIFIED LOGIC ---
                // The check for a positive balance has been removed.
                // The system will now ALWAYS allocate a payment if the student ID matches.

                logger.info("Auto-allocating payment {} to student {}", payment.getId(), student.getStudentId());

                FinancialLedger creditEntry = new FinancialLedger();
                creditEntry.setStudent(student);
                creditEntry.setTransactionType(TransactionType.CREDIT);
                creditEntry.setAmount(BigDecimal.valueOf(payment.getAmount()));
                creditEntry.setCurrency(Currency.USD); // Defaulting to USD
                creditEntry.setDescription("Auto-Allocated Prepayment/Credit. Ref: " + payment.getReference());
                creditEntry.setTransactionDate(LocalDate.now());
                creditEntry.setPaymentAlertId(payment.getId());
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
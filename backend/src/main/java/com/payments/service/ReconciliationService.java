package com.payments.service;

import com.payments.model.*;
import com.payments.repository.FinancialLedgerRepository;
import com.payments.repository.InstitutionRepository; // <-- IMPORT
import com.payments.repository.PaymentRepository;
import com.payments.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ReconciliationService {

    private static final Logger logger = LoggerFactory.getLogger(ReconciliationService.class);

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private FinancialLedgerRepository ledgerRepository;
    @Autowired private SystemSettingsService settingsService;
    @Autowired private InstitutionRepository institutionRepository; // <-- Inject InstitutionRepository

    /**
     * Master scheduled job that iterates through all institutions and runs
     * the reconciliation process for each one separately.
     */
    @Scheduled(fixedRateString = "${reconciliation.job.fixedRate:300000}")
    @Transactional
    public void runMasterReconciliationJob() {
        logger.info("Starting master automatic payment reconciliation job...");

        // Fetch all active institutions from the database.
        List<Institution> institutions = institutionRepository.findAll();

        if (institutions.isEmpty()) {
            logger.info("No institutions found to process.");
            return;
        }

        // Run the reconciliation logic for each institution in a separate loop.
        for (Institution institution : institutions) {
            reconcilePaymentsForInstitution(institution);
        }

        logger.info("Finished master reconciliation job for {} institutions.", institutions.size());
    }

    /**
     * Performs the payment reconciliation for a single, specific institution.
     * This ensures all data operations are strictly scoped to one tenant.
     * @param institution The institution to process payments for.
     */
    public void reconcilePaymentsForInstitution(Institution institution) {
        logger.info("Running reconciliation for institution: '{}' (ID: {})", institution.getName(), institution.getId());

        // 1. Fetch PENDING payments ONLY for the specified institution.
        List<PaymentAlert> pendingPayments = paymentRepository.findByStatusAndInstitution("PENDING", institution);

        if (pendingPayments.isEmpty()) {
            logger.info("No pending payments to reconcile for institution: '{}'", institution.getName());
            return;
        }

        // 2. Get the system settings specific to this institution.
        // This assumes SystemSettingsService has been refactored for multi-tenancy.
        SystemSettings currentSettings = settingsService.getSystemSettingsForInstitution(institution);

        int processedCount = 0;
        for (PaymentAlert payment : pendingPayments) {
            if (payment.getRegNumber() == null || payment.getRegNumber().isBlank()) {
                logger.warn("Skipping payment ID {} for institution '{}': Registration number is missing.", payment.getId(), institution.getName());
                continue;
            }

            // 3. Look for the student by their ID *within the same institution*. This is the critical security step.
            Optional<Student> studentOpt = studentRepository.findByStudentIdAndInstitution(payment.getRegNumber(), institution);

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                logger.info("Auto-allocating payment {} to student {} in institution '{}'", payment.getId(), student.getStudentId(), institution.getName());

                FinancialLedger creditEntry = new FinancialLedger();
                creditEntry.setStudent(student);
                creditEntry.setInstitution(institution); // <-- Explicitly stamp the institution
                creditEntry.setTransactionType(TransactionType.CREDIT);
                creditEntry.setAmount(payment.getAmount());
                creditEntry.setCurrency(Currency.valueOf(payment.getCurrency()));
                creditEntry.setDescription("Auto-Allocated Payment. Ref: " + payment.getReference());
                creditEntry.setTransactionDate(LocalDate.now());
                creditEntry.setPaymentAlertId(payment.getId());
                creditEntry.setAcademicYear(currentSettings.getCurrentAcademicYear());
                creditEntry.setSemester(currentSettings.getCurrentSemester());

                ledgerRepository.save(creditEntry);

                payment.setStatus("AUTO_ALLOCATED");
                paymentRepository.save(payment);
                processedCount++;
            } else {
                logger.warn("Could not find student with ID '{}' in institution '{}' for payment {}. Manual allocation required.",
                        payment.getRegNumber(), institution.getName(), payment.getId());
            }
        }
        logger.info("Finished reconciliation for institution: '{}'. Processed {} of {} pending payments.", institution.getName(), processedCount, pendingPayments.size());
    }
}
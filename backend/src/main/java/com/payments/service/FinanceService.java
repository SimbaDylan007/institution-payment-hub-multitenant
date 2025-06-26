
package com.payments.service;

import com.payments.model.Fee;
import com.payments.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FinanceService {
    
    @Autowired
    private FeeRepository feeRepository;
    
    // Fee management
    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }
    
    public Optional<Fee> getFeeById(Long id) {
        return feeRepository.findById(id);
    }
    
    public List<Fee> getFeesByStudent(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }
    
    public List<Fee> getFeesByType(String feeType) {
        return feeRepository.findByFeeType(feeType);
    }
    
    public List<Fee> getFeesByStatus(String status) {
        return feeRepository.findByStatus(status);
    }
    
    public List<Fee> getOverdueFees() {
        return feeRepository.findByDueDateBefore(LocalDate.now());
    }
    
    @Transactional
    public Fee createFee(Fee fee) {
        if (fee.getDueDate().isBefore(LocalDate.now())) {
            fee.setStatus("OVERDUE");
        } else {
            fee.setStatus("PENDING");
        }
        return feeRepository.save(fee);
    }
    
    @Transactional
    public Fee updateFee(Long id, Fee feeDetails) {
        Optional<Fee> optionalFee = feeRepository.findById(id);
        if (optionalFee.isPresent()) {
            Fee fee = optionalFee.get();
            fee.setFeeType(feeDetails.getFeeType());
            fee.setAmount(feeDetails.getAmount());
            fee.setDueDate(feeDetails.getDueDate());
            fee.setDescription(feeDetails.getDescription());
            fee.setStatus(feeDetails.getStatus());
            
            if ("PAID".equals(feeDetails.getStatus()) && fee.getPaidDate() == null) {
                fee.setPaidDate(LocalDate.now());
            }
            
            return feeRepository.save(fee);
        }
        return null;
    }
    
    @Transactional
    public Fee processPayment(Long feeId, String paymentMethod, String transactionId) {
        Optional<Fee> optionalFee = feeRepository.findById(feeId);
        if (optionalFee.isPresent()) {
            Fee fee = optionalFee.get();
            fee.setStatus("PAID");
            fee.setPaidDate(LocalDate.now());
            fee.setPaymentMethod(paymentMethod);
            fee.setTransactionId(transactionId);
            fee.setPaidAmount(fee.getAmount());
            return feeRepository.save(fee);
        }
        return null;
    }
    
    // Financial reporting
    public BigDecimal getTotalCollected(LocalDate startDate, LocalDate endDate) {
        BigDecimal total = feeRepository.getTotalCollectedBetweenDates(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalPending() {
        BigDecimal total = feeRepository.getTotalPendingAmount();
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalOverdue() {
        BigDecimal total = feeRepository.getTotalOverdueAmount();
        return total != null ? total : BigDecimal.ZERO;
    }
    
    @Transactional
    public void updateOverdueFees() {
        List<Fee> overdueFees = feeRepository.findByDueDateBefore(LocalDate.now());
        for (Fee fee : overdueFees) {
            if ("PENDING".equals(fee.getStatus())) {
                fee.setStatus("OVERDUE");
                feeRepository.save(fee);
            }
        }
    }
}

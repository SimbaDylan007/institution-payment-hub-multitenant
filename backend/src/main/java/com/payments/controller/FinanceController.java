
package com.payments.controller;

import com.payments.model.Fee;
import com.payments.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {
    
    @Autowired
    private FinanceService financeService;
    
    @GetMapping("/fees")
    public ResponseEntity<List<Fee>> getAllFees() {
        List<Fee> fees = financeService.getAllFees();
        return ResponseEntity.ok(fees);
    }
    
    @GetMapping("/fees/{id}")
    public ResponseEntity<Fee> getFeeById(@PathVariable Long id) {
        Optional<Fee> fee = financeService.getFeeById(id);
        return fee.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/fees/student/{studentId}")
    public ResponseEntity<List<Fee>> getFeesByStudent(@PathVariable Long studentId) {
        List<Fee> fees = financeService.getFeesByStudent(studentId);
        return ResponseEntity.ok(fees);
    }
    
    @GetMapping("/fees/type/{type}")
    public ResponseEntity<List<Fee>> getFeesByType(@PathVariable String type) {
        List<Fee> fees = financeService.getFeesByType(type);
        return ResponseEntity.ok(fees);
    }
    
    @GetMapping("/fees/status/{status}")
    public ResponseEntity<List<Fee>> getFeesByStatus(@PathVariable String status) {
        List<Fee> fees = financeService.getFeesByStatus(status);
        return ResponseEntity.ok(fees);
    }
    
    @GetMapping("/fees/overdue")
    public ResponseEntity<List<Fee>> getOverdueFees() {
        List<Fee> fees = financeService.getOverdueFees();
        return ResponseEntity.ok(fees);
    }
    
    @PostMapping("/fees")
    public ResponseEntity<Fee> createFee(@RequestBody Fee fee) {
        Fee createdFee = financeService.createFee(fee);
        return ResponseEntity.ok(createdFee);
    }
    
    @PutMapping("/fees/{id}")
    public ResponseEntity<Fee> updateFee(@PathVariable Long id, @RequestBody Fee fee) {
        Fee updatedFee = financeService.updateFee(id, fee);
        if (updatedFee != null) {
            return ResponseEntity.ok(updatedFee);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/fees/{id}/payment")
    public ResponseEntity<Fee> processPayment(@PathVariable Long id, 
                                            @RequestParam String paymentMethod,
                                            @RequestParam String transactionId) {
        Fee paidFee = financeService.processPayment(id, paymentMethod, transactionId);
        if (paidFee != null) {
            return ResponseEntity.ok(paidFee);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCollected", financeService.getTotalCollected(startOfMonth, endOfMonth));
        summary.put("totalPending", financeService.getTotalPending());
        summary.put("totalOverdue", financeService.getTotalOverdue());
        
        return ResponseEntity.ok(summary);
    }
    
    @PostMapping("/maintenance/update-overdue")
    public ResponseEntity<String> updateOverdueFees() {
        financeService.updateOverdueFees();
        return ResponseEntity.ok("Overdue fees updated successfully");
    }
}

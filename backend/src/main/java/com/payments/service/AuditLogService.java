package com.payments.service;

import com.payments.model.AuditLog;
import com.payments.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(AuditLog log) {
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAuditLogs(String username, String action, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findWithFilters(username, action, startDate, endDate, pageable);
    }
}
package com.payments.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.payments.model.AuditLog;
import com.payments.service.AuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Component
@Configuration // Add this to allow @Bean definition
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    // Define a thread-safe ObjectMapper bean
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // Good practice for modern date/time objects
        return mapper;
    }

    // --- CRITICAL FIX: The pointcut now scans sub-packages as well ---
    // The two dots (..) after "service" means "this package and any sub-packages"
    @Pointcut("execution(public * com.payments.service..*.*(..)) " +
            "&& !within(com.payments.service.AuditLogService) " +
            "&& !within(com.payments.service.CustomUserDetailsService)")
    public void serviceMethods() {}

    @Around("serviceMethods()")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        AuditLog log = new AuditLog();
        log.setTimestamp(LocalDateTime.now());
        log.setUsername(getUsername());
        log.setAction(joinPoint.getSignature().toShortString());
        log.setIpAddress(getIpAddress());

        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                // Convert args to JSON, filtering out sensitive types like MultipartFile
                String details = Arrays.stream(args)
                        .filter(arg -> !(arg instanceof org.springframework.web.multipart.MultipartFile))
                        .map(arg -> {
                            try { return objectMapper().writeValueAsString(arg); }
                            catch (Exception e) { return "Unserializable Argument"; }
                        })
                        .collect(Collectors.joining(", "));
                log.setDetails(details);
            }
        } catch (Exception e) {
            log.setDetails("Could not serialize arguments: " + e.getMessage());
        }

        try {
            Object result = joinPoint.proceed();
            log.setStatus("SUCCESS");
            return result;
        } catch (Throwable t) {
            log.setStatus("FAILURE");
            String existingDetails = log.getDetails() != null ? log.getDetails() : "";
            log.setDetails(existingDetails + "\nException: " + t.getMessage());
            throw t;
        } finally {
            auditLogService.log(log);
        }
    }

    private String getUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal != null) {
            return principal.toString();
        }
        return "anonymous";
    }

    private String getIpAddress() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes) {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            return request.getRemoteAddr();
        }
        return "unknown";
    }
}
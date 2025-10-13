package com.payments.config;

import com.payments.model.Institution;
import com.payments.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.lang.reflect.Method;

@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    // This pointcut targets all public methods in your service layer
    @Before("execution(public * com.payments.service..*.*(..))")
    public void enableTenantFilter(JoinPoint joinPoint) { // Add JoinPoint to access method details
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // --- THIS IS THE FIX ---
        // Check if the method itself or the class it belongs to has our custom annotation.
        if (method.isAnnotationPresent(GlobalDataAccess.class) ||
                joinPoint.getTarget().getClass().isAnnotationPresent(GlobalDataAccess.class)) {
            // If the annotation is found, it means this is a global service.
            // We do nothing and exit the aspect immediately.
            return;
        }
        // --- END OF FIX ---

        Session session = entityManager.unwrap(Session.class);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            boolean isSuperAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

            if (isSuperAdmin) {
                // For a super admin, disable the filter so they can see all data
                session.disableFilter("institutionFilter");
                return;
            }

            // For all other users, find their institution and apply the filter
            userRepository.findByUsername(userDetails.getUsername()).ifPresent(user -> {
                Institution institution = user.getInstitution();
                if (institution != null) {
                    session.enableFilter("institutionFilter").setParameter("institutionId", institution.getId());
                } else {
                    // Failsafe: if a non-super-admin user has no institution, they see nothing
                    session.enableFilter("institutionFilter").setParameter("institutionId", -1L);
                }
            });
        }
    }
}
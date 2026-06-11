package com.mst.agritech.audit;

import com.mst.agritech.domain.entity.AuditLog;
import com.mst.agritech.domain.entity.User;
import com.mst.agritech.repository.AuditLogRepository;
import com.mst.agritech.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {
        String ipAddress = null;
        String userAgent = null;
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                ipAddress = req.getRemoteAddr();
                userAgent = req.getHeader("User-Agent");
            }
        } catch (Exception ignored) {}

        int responseStatus = 200;
        String errorMsg = null;
        try {
            Object result = pjp.proceed();
            return result;
        } catch (Throwable t) {
            responseStatus = 500;
            errorMsg = t.getMessage();
            throw t;
        } finally {
            User user = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                user = userRepository.findByEmail(auth.getName()).orElse(null);
            }
            AuditLog log = AuditLog.builder()
                    .user(user)
                    .action(auditable.action())
                    .entityType(auditable.entityType())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .responseStatus(responseStatus)
                    .errorMessage(errorMsg)
                    .build();
            auditLogRepository.save(log);
        }
    }
}

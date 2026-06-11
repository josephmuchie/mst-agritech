package com.mst.agritech.controller;

import com.mst.agritech.domain.entity.AuditLog;
import com.mst.agritech.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System audit trail (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all audit log entries (paginated)")
    public ResponseEntity<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(auditLogRepository.findAll(pageable).map(this::toMap));
    }

    private Map<String, Object> toMap(AuditLog log) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", log.getId());
        m.put("userId", log.getUser() != null ? log.getUser().getId() : null);
        m.put("action", log.getAction());
        m.put("entityType", log.getEntityType());
        m.put("entityId", log.getEntityId());
        m.put("ipAddress", log.getIpAddress());
        m.put("responseStatus", log.getResponseStatus());
        m.put("errorMessage", log.getErrorMessage());
        m.put("createdAt", log.getCreatedAt());
        return m;
    }
}

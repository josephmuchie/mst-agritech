package com.mst.agritech.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mst.agritech.domain.entity.AuditLog;
import com.mst.agritech.domain.entity.User;
import com.mst.agritech.dto.request.ApiIngestionRequest;
import com.mst.agritech.dto.request.DesktopSyncChangeRequest;
import com.mst.agritech.dto.request.DesktopSyncRequest;
import com.mst.agritech.dto.response.DataImportJobResponse;
import com.mst.agritech.dto.response.DesktopSyncChangeResponse;
import com.mst.agritech.dto.response.DesktopSyncResponse;
import com.mst.agritech.repository.AuditLogRepository;
import com.mst.agritech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DesktopSyncService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final DataIngestionService dataIngestionService;
    private final ObjectMapper objectMapper;

    @Transactional
    public DesktopSyncResponse sync(DesktopSyncRequest request, Authentication authentication) {
        User user = authentication == null ? null : userRepository.findByEmail(authentication.getName()).orElse(null);
        List<DesktopSyncChangeResponse> results = new ArrayList<>();

        for (DesktopSyncChangeRequest change : request.getChanges()) {
            results.add(acceptChange(change, user, authentication));
        }

        return DesktopSyncResponse.builder()
                .accepted(results.size())
                .failed(0)
                .results(results)
                .build();
    }

    private DesktopSyncChangeResponse acceptChange(
            DesktopSyncChangeRequest change,
            User user,
            Authentication authentication) {

        String status = "ACCEPTED";
        String message = "Desktop change received";
        Long importJobId = null;

        try {
            if ("Data Ingestion".equalsIgnoreCase(change.getModule())) {
                DataImportJobResponse importJob = tryRunDataIngestion(change, authentication);
                if (importJob != null) {
                    status = "IMPORTED";
                    message = "Data ingestion job " + importJob.getStatus();
                    importJobId = importJob.getId();
                }
            }
        } catch (Exception ex) {
            status = "ACCEPTED_WITH_SERVER_PROCESSING_ERROR";
            message = ex.getMessage();
        }

        AuditLog auditLog = auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("DESKTOP_SYNC_" + change.getOperation().toUpperCase())
                .entityType(change.getModule())
                .entityId(change.getRecordId() == null ? String.valueOf(change.getQueueId()) : String.valueOf(change.getRecordId()))
                .userAgent("MST-Agritech-Desktop")
                .requestPayload(toJson(change.getPayload()))
                .responseStatus(202)
                .errorMessage(status.endsWith("ERROR") ? message : null)
                .build());

        return DesktopSyncChangeResponse.builder()
                .queueId(change.getQueueId())
                .recordId(change.getRecordId())
                .module(change.getModule())
                .operation(change.getOperation())
                .status(status)
                .message(message)
                .serverAuditId(auditLog.getId())
                .importJobId(importJobId)
                .build();
    }

    @SuppressWarnings("unchecked")
    private DataImportJobResponse tryRunDataIngestion(DesktopSyncChangeRequest change, Authentication authentication) {
        Object body = change.getPayload().get("body");
        if (!(body instanceof Map<?, ?> bodyMap)) {
            return null;
        }
        if (!bodyMap.containsKey("importType") || !bodyMap.containsKey("records")) {
            return null;
        }

        ApiIngestionRequest request = objectMapper.convertValue((Map<String, Object>) bodyMap, ApiIngestionRequest.class);
        return dataIngestionService.ingestApi(request, authentication);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return String.valueOf(value);
        }
    }
}

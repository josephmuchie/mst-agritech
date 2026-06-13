package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String notificationType;
    private String entityType;
    private String entityId;
    private boolean read;
    private LocalDateTime createdAt;
}

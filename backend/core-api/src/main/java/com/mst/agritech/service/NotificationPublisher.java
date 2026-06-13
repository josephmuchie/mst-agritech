package com.mst.agritech.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mst.agritech.dto.response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void publish(NotificationResponse notification, Long userId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("notification", notification);

        try {
            String json = objectMapper.writeValueAsString(payload);
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, json);

            String channel = channelForType(notification.getNotificationType());
            if (channel != null) {
                redisTemplate.convertAndSend(channel, json);
            }
            redisTemplate.convertAndSend("notification-events", json);
        } catch (JsonProcessingException ex) {
            log.warn("Failed to publish notification event: {}", ex.getMessage());
        }
    }

    private String channelForType(String type) {
        if (type == null) return null;
        return switch (type.toUpperCase()) {
            case "ORDER" -> "order-events";
            case "PAYMENT" -> "payment-events";
            case "SHIPMENT" -> "shipment-events";
            default -> null;
        };
    }
}

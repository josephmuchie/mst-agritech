package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Notification;
import com.mst.agritech.domain.entity.User;
import com.mst.agritech.dto.response.NotificationResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.NotificationRepository;
import com.mst.agritech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPublisher notificationPublisher;

    public Page<NotificationResponse> listForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", notificationId);
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void notifyAdmins(String title, String message, String type, String entityType, String entityId) {
        List<User> admins = userRepository.findActiveAdmins();
        for (User admin : admins) {
            createForUser(admin.getId(), title, message, type, entityType, entityId);
        }
    }

    @Transactional
    public NotificationResponse createForUser(
            Long userId, String title, String message,
            String type, String entityType, String entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .notificationType(type)
                .entityType(entityType)
                .entityId(entityId)
                .read(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);
        notificationPublisher.publish(response, userId);
        return response;
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

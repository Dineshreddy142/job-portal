package com.jobportal.controller;

import com.jobportal.dto.NotificationDto;
import com.jobportal.entity.Notification;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable Long userId, Authentication authentication) {
        Objects.requireNonNull(userId, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, userId);
        List<NotificationDto> notifications = notificationRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream().map(n -> {
                    NotificationDto dto = new NotificationDto();
                    dto.setId(n.getId());
                    dto.setMessage(n.getMessage());
                    dto.setRead(n.isRead());
                    dto.setTimestamp(n.getTimestamp());
                    return dto;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        Objects.requireNonNull(id, "Notification ID must not be null");
        Notification notification = notificationRepository.findById(id).orElseThrow();
        // Verify the notification belongs to the authenticated user
        securityUtils.verifyOwnership(authentication, notification.getUser().getId());
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }
}

package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.Notification;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.NotificationRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();

        // Auto-generate some welcome notifications if empty for demonstration
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (notifications.isEmpty()) {
            Notification welcome = new Notification();
            welcome.setUser(user);
            welcome.setTitle("Welcome to MutualT!");
            welcome.setMessage("Complete your profile and verification to start matching.");
            welcome.setType("SYSTEM");
            welcome.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(welcome);

            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        List<Map<String, Object>> response = notifications.stream().map(n -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", n.getId());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("isRead", n.isRead());
            map.put("createdAt", n.getCreatedAt().toString());
            map.put("type", n.getType());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Notification notification = notificationRepository.findById(id).orElseThrow();

        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());

        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);

        return ResponseEntity.ok(Map.of("success", true, "count", unread.size()));
    }
}

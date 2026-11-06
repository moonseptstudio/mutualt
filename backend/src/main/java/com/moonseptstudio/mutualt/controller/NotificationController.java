package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.Notification;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.NotificationRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
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

    @Autowired
    private UserProfileRepository profileRepository;

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

        Map<String, String> nameCache = new java.util.HashMap<>();
        for (Notification n : notifications) {
            String msg = n.getMessage();
            if (msg == null) continue;

            String updatedMsg = resolveMessageWithDisplayName(msg, nameCache);
            if (!msg.equals(updatedMsg)) {
                n.setMessage(updatedMsg);
                notificationRepository.save(n);
            }
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

    private String resolveMessageWithDisplayName(String msg, Map<String, String> nameCache) {
        if (msg == null || msg.trim().isEmpty()) {
            return msg;
        }

        if (msg.endsWith(" sent you a new match request.")) {
            String username = msg.substring(0, msg.indexOf(" sent you a new match request.")).trim();
            String displayName = getDisplayNameByUsername(username, nameCache);
            return displayName + " sent you a new match request.";
        }

        if (msg.endsWith(" accepted your match request.")) {
            String username = msg.substring(0, msg.indexOf(" accepted your match request.")).trim();
            String displayName = getDisplayNameByUsername(username, nameCache);
            return displayName + " accepted your match request.";
        }

        if (msg.contains(" sent a message in ")) {
            int idx = msg.indexOf(" sent a message in ");
            String username = msg.substring(0, idx).trim();
            String roomPart = msg.substring(idx + " sent a message in ".length()).trim();
            String displayName = getDisplayNameByUsername(username, nameCache);
            return displayName + " sent a message in " + roomPart;
        }

        return msg;
    }

    private String getDisplayNameByUsername(String username, Map<String, String> nameCache) {
        if (nameCache.containsKey(username)) {
            return nameCache.get(username);
        }

        String displayName = userRepository.findByUsername(username)
                .map(u -> profileRepository.findByUserId(u.getId())
                        .map(UserProfile::getFullName)
                        .filter(name -> name != null && !name.trim().isEmpty())
                        .orElse(username))
                .orElse(username);

        nameCache.put(username, displayName);
        return displayName;
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") Long id, Authentication authentication) {
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

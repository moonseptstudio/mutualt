package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.AdminStatsDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.UserProfileRepository userProfileRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.MatchRequestRepository matchRequestRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.MessageRepository messageRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.NotificationRepository notificationRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.TransferPreferenceRepository transferPreferenceRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.UserSettingsRepository userSettingsRepository;

    @Autowired
    com.moonseptstudio.mutualt.repository.ChatRoomRepository chatRoomRepository;

    @GetMapping
    public List<com.moonseptstudio.mutualt.dto.UserAdminDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            com.moonseptstudio.mutualt.dto.UserAdminDto dto = new com.moonseptstudio.mutualt.dto.UserAdminDto();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setRole(user.getRole());
            dto.setVerified(user.isVerified());
            dto.setLastSeen(user.getLastSeen());
            if (user.getSubscriptionPackage() != null) {
                dto.setPackageName(user.getSubscriptionPackage().getName());
                dto.setSubscriptionEndDate(user.getSubscriptionEndDate());
            }

            userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                dto.setFullName(profile.getFullName() != null ? profile.getFullName() : user.getUsername());
                if (profile.getJobCategory() != null && profile.getJobCategory().getField() != null) {
                    dto.setFieldName(profile.getJobCategory().getField().getName());
                }
            });
            if (dto.getFullName() == null) {
                dto.setFullName(user.getUsername());
            }

            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> toggleUserVerification(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setVerified(!user.isVerified());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User verification status updated", "verified", user.isVerified()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            return userRepository.findById(id).map(user -> {
                System.out.println("Starting deletion cleanup for user: " + user.getUsername() + " (ID: " + id + ")");
                
                // Use declarative delete methods
                notificationRepository.deleteByUserId(id);
                matchRequestRepository.deleteBySender(user);
                matchRequestRepository.deleteByReceiver(user);
                transferPreferenceRepository.deleteByUserId(id);
                messageRepository.deleteBySender(user);
                messageRepository.deleteByReceiver(user);
                userSettingsRepository.deleteByUserId(id);
                
                chatRoomRepository.findByMember(user).forEach(room -> {
                    room.getMembers().remove(user);
                    chatRoomRepository.save(room);
                });
                
                userProfileRepository.findByUserId(id).ifPresent(userProfileRepository::delete);
                userRepository.delete(user);
                
                System.out.println("Successfully deleted user " + id);
                return ResponseEntity.ok(Map.of("message", "User and all associated data deleted successfully"));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error deleting user " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to delete user: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long activePremium = userRepository.countBySubscriptionPackageName("PREMIUM");
        long pendingVerifications = userRepository.countByVerifiedFalse();
        long totalMatches = matchRequestRepository.count();

        // Real system load simulation or calculation
        double systemLoad = 10.0 + (totalUsers * 0.1) + (totalMatches * 0.5);
        if (systemLoad > 95) systemLoad = 98.2;

        // Daily Activity (Last 7 days)
        List<AdminStatsDto.DailyActivity> activity = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String[] days = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime start = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            java.time.LocalDateTime end = start.plusDays(1);
            long count = matchRequestRepository.findAll().stream()
                    .filter(mr -> mr.getCreatedAt() != null && mr.getCreatedAt().isAfter(start) && mr.getCreatedAt().isBefore(end))
                    .count();
            
            int dayOfWeek = start.getDayOfWeek().getValue() % 7;
            activity.add(new AdminStatsDto.DailyActivity(days[dayOfWeek], (int)count));
        }

        // Real System Events
        List<AdminStatsDto.SystemEvent> events = new ArrayList<>();
        
        // Recent Registrations
        userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null)
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(3)
                .forEach(u -> {
                    java.time.Duration diff = java.time.Duration.between(u.getCreatedAt(), now);
                    String timeStr = formatDuration(diff);
                    events.add(AdminStatsDto.SystemEvent.builder()
                            .type("Registration")
                            .msg("New user registered: " + u.getUsername())
                            .time(timeStr)
                            .icon("Users")
                            .color("primary")
                            .build());
                });

        // Recent Match Requests
        matchRequestRepository.findAll().stream()
                .filter(mr -> mr.getCreatedAt() != null)
                .sorted((mr1, mr2) -> mr2.getCreatedAt().compareTo(mr1.getCreatedAt()))
                .limit(3)
                .forEach(mr -> {
                    java.time.Duration diff = java.time.Duration.between(mr.getCreatedAt(), now);
                    String timeStr = formatDuration(diff);
                    events.add(AdminStatsDto.SystemEvent.builder()
                            .type("Match Request")
                            .msg(mr.getSender().getUsername() + " → " + mr.getReceiver().getUsername())
                            .time(timeStr)
                            .icon("Zap")
                            .color("emerald")
                            .build());
                });

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .activePremiumUsers(activePremium)
                .pendingVerifications(pendingVerifications)
                .totalMatchRequests(totalMatches)
                .systemLoad(systemLoad)
                .recentActivity(activity)
                .systemEvents(events.stream()
                        .sorted((e1, e2) -> e1.getTime().contains("now") ? -1 : 1) // Rough sort for mock simplicity
                        .limit(5)
                        .collect(java.util.stream.Collectors.toList()))
                .build();
    }

    private String formatDuration(java.time.Duration diff) {
        if (diff.toMinutes() < 1) return "just now";
        if (diff.toMinutes() < 60) return diff.toMinutes() + " mins ago";
        if (diff.toHours() < 24) return diff.toHours() + " hours ago";
        return diff.toDays() + " days ago";
    }
}

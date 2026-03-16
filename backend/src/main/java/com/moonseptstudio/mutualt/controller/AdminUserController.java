package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
            }

            userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                dto.setFullName(profile.getFullName() != null ? profile.getFullName() : user.getUsername());
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
}

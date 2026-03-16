package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.MatchRequestDto;
import com.moonseptstudio.mutualt.model.ChatRoom;
import com.moonseptstudio.mutualt.repository.ChatRoomRepository;
import com.moonseptstudio.mutualt.model.MatchRequest;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.model.Notification;
import com.moonseptstudio.mutualt.repository.MatchRequestRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/requests")
public class MatchRequestController {

    @Autowired
    MatchRequestRepository requestRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository profileRepository;

    @Autowired
    ChatRoomRepository chatRoomRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyRequests(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();

        boolean hasPackage = user.getSubscriptionPackage() != null;

        List<MatchRequestDto> incoming = requestRepository.findByReceiver(user).stream()
                .map(req -> convertToDto(req, hasPackage, user.getId())).collect(Collectors.toList());

        List<MatchRequestDto> outgoing = requestRepository.findBySender(user).stream()
                .map(req -> convertToDto(req, hasPackage, user.getId())).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("incoming", incoming, "outgoing", outgoing));
    }

    @PostMapping
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> payload, Authentication authentication) {
        User sender = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        User receiver = userRepository.findById(receiverId).orElseThrow();

        if (sender.getSubscriptionPackage() == null) {
            return ResponseEntity.status(403).body("You must purchase a package to send requests");
        }

        if (sender.getId().equals(receiver.getId())) {
            return ResponseEntity.badRequest().body("Cannot send request to yourself");
        }

        // Check for existing pending request
        if (requestRepository.existsBySenderAndReceiverAndStatus(sender, receiver, "PENDING")) {
            return ResponseEntity.badRequest().body("Request already pending");
        }

        MatchRequest request = new MatchRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus("PENDING");
        request.setMatchType(payload.getOrDefault("matchType", "DIRECT").toString());
        request.setCycleUserIds(payload.getOrDefault("cycleUserIds", "").toString());
        request.setCreatedAt(LocalDateTime.now());

        requestRepository.save(request);

        Notification notif = new Notification();
        notif.setUser(receiver);
        notif.setTitle("New Match Request");
        notif.setMessage(sender.getUsername() + " sent you a new match request.");
        notif.setType("MATCH");
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        return ResponseEntity.ok(convertToDto(request));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable("id") Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        MatchRequest request = requestRepository.findById(id).orElseThrow();

        if (!request.getReceiver().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to accept this request");
        }

        request.setStatus("ACCEPTED");
        requestRepository.save(request);

        // CREATE CHAT ROOM
        if ("TRIPLE".equals(request.getMatchType())) {
            Set<User> members = new HashSet<>();
            members.add(request.getSender());
            members.add(request.getReceiver());

            // Add other users from cycleUserIds
            if (request.getCycleUserIds() != null && !request.getCycleUserIds().isEmpty()) {
                String[] ids = request.getCycleUserIds().split(",");
                for (String userIdStr : ids) {
                    try {
                        Long uid = Long.parseLong(userIdStr.trim());
                        userRepository.findById(uid).ifPresent(members::add);
                    } catch (NumberFormatException e) {
                        // skip
                    }
                }
            }

            // Check if a GROUP room with these exact members already exists
            List<ChatRoom> existingRooms = chatRoomRepository.findByMember(user);
            boolean roomExists = existingRooms.stream()
                    .filter(r -> "GROUP".equals(r.getType()))
                    .anyMatch(r -> r.getMembers().size() == members.size() && r.getMembers().containsAll(members));

            if (!roomExists) {
                ChatRoom room = new ChatRoom();
                room.setName("Group Chat: " + request.getSender().getUsername() + " & others");
                room.setType("GROUP");
                room.setMembers(members);
                chatRoomRepository.save(room);
            }
        } else {
            // DIRECT match - create DIRECT chat room
            Set<User> members = new HashSet<>();
            members.add(request.getSender());
            members.add(request.getReceiver());

            // Check if a DIRECT room with these exact members already exists
            List<ChatRoom> existingRooms = chatRoomRepository.findByMember(user);
            boolean roomExists = existingRooms.stream()
                    .filter(r -> "DIRECT".equals(r.getType()))
                    .anyMatch(r -> r.getMembers().size() == 2 && r.getMembers().containsAll(members));

            if (!roomExists) {
                ChatRoom room = new ChatRoom();
                room.setName(request.getSender().getUsername() + " & " + request.getReceiver().getUsername());
                room.setType("DIRECT");
                room.setMembers(members);
                chatRoomRepository.save(room);
            }
        }

        return ResponseEntity.ok(convertToDto(request, user.getSubscriptionPackage() != null, user.getId()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable("id") Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        MatchRequest request = requestRepository.findById(id).orElseThrow();

        if (!request.getReceiver().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to reject this request");
        }

        request.setStatus("REJECTED");
        requestRepository.save(request);
        return ResponseEntity.ok(convertToDto(request));
    }

    private MatchRequestDto convertToDto(MatchRequest req, boolean hasPackage, Long currentUserId) {
        MatchRequestDto dto = new MatchRequestDto();
        dto.setId(req.getId());
        dto.setSenderId(req.getSender().getId());
        dto.setReceiverId(req.getReceiver().getId());
        dto.setStatus(req.getStatus());
        dto.setMatchType(req.getMatchType());
        dto.setCycleUserIds(req.getCycleUserIds());
        dto.setCreatedAt(req.getCreatedAt());

        UserProfile senderProfile = profileRepository.findByUserId(req.getSender().getId()).orElse(null);
        UserProfile receiverProfile = profileRepository.findByUserId(req.getReceiver().getId()).orElse(null);

        if (senderProfile != null) {
            String name = (senderProfile.getFullName() != null && !senderProfile.getFullName().isEmpty()) 
                ? senderProfile.getFullName() 
                : req.getSender().getUsername();
            dto.setSenderName(name);

            dto.setSenderProfileImageUrl(senderProfile.getProfileImageUrl());

            dto.setSenderStationName(
                    senderProfile.getCurrentStation() != null ? senderProfile.getCurrentStation().getName() : "N/A");
        }
        if (receiverProfile != null) {
            String name = (receiverProfile.getFullName() != null && !receiverProfile.getFullName().isEmpty()) 
                ? receiverProfile.getFullName() 
                : req.getReceiver().getUsername();
            dto.setReceiverName(name);

            dto.setReceiverProfileImageUrl(receiverProfile.getProfileImageUrl());

            dto.setReceiverStationName(
                    receiverProfile.getCurrentStation() != null ? receiverProfile.getCurrentStation().getName()
                            : "N/A");
        }

        // Populating contact info if accepted
        if ("ACCEPTED".equals(req.getStatus())) {
            if (senderProfile != null) {
                dto.setSenderPhone(senderProfile.getPhoneNumber());
                dto.setSenderEmail(senderProfile.getEmail());
            }
            if (receiverProfile != null) {
                dto.setReceiverPhone(receiverProfile.getPhoneNumber());
                dto.setReceiverEmail(receiverProfile.getEmail());
            }
        }

        return dto;
    }

    private MatchRequestDto convertToDto(MatchRequest req) {
        // Fallback or admin endpoints might use this, assuming hasPackage = true for simplicity here.
        // But let's avoid calling this without explicit user context.
        return convertToDto(req, true, req.getSender().getId());
    }


}

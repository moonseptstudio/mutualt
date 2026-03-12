package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.ChatRoom;
import com.moonseptstudio.mutualt.dto.ChatRoomDto;
import com.moonseptstudio.mutualt.repository.ChatRoomRepository;
import com.moonseptstudio.mutualt.dto.MessageDto;
import com.moonseptstudio.mutualt.model.Message;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.model.Notification;
import com.moonseptstudio.mutualt.repository.MessageRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
@Transactional
public class MessageController {

    @Autowired
    MessageRepository messageRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository profileRepository;

    @Autowired
    ChatRoomRepository chatRoomRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/rooms")
    public ResponseEntity<?> getMyChatRooms(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        boolean hasPackage = user.getSubscriptionPackage() != null;
        
        // 1. Fetch rooms (EntityGraph handles members)
        List<ChatRoom> rawRooms = chatRoomRepository.findByMember(user);
        if (rawRooms.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        // 2. Collect all member user IDs to batch fetch profiles
        List<Long> memberIds = rawRooms.stream()
                .flatMap(r -> r.getMembers().stream())
                .map(User::getId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, UserProfile> profileMap = profileRepository.findByUserIdIn(memberIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), p -> p, (p1, p2) -> p1));

        // 3. Batch fetch latest messages
        Map<Long, Message> lastMessageMap = messageRepository.findLatestMessagesByRooms(rawRooms).stream()
                .collect(Collectors.toMap(m -> m.getChatRoom().getId(), m -> m));

        // 4. Batch fetch unread counts
        Map<Long, Integer> unreadCountMap = messageRepository.countUnreadMessagesByRooms(rawRooms, user).stream()
                .collect(Collectors.toMap(
                    row -> (Long) row[0],
                    row -> ((Long) row[1]).intValue()
                ));

        // 5. Convert to DTOs using pre-fetched data
        List<ChatRoomDto> rooms = rawRooms.stream()
                .map(room -> {
                    ChatRoomDto dto = new ChatRoomDto();
                    dto.setId(room.getId());
                    dto.setType(room.getType());
                    
                    if ("DIRECT".equals(room.getType()) && !hasPackage) {
                        dto.setName("Direct Chat");
                    } else {
                        dto.setName(room.getName());
                    }

                    dto.setMembers(room.getMembers().stream()
                        .map(m -> {
                            ChatRoomDto.UserSummaryDto summary = new ChatRoomDto.UserSummaryDto();
                            summary.setId(m.getId());
                            summary.setName(m.getUsername());
                            summary.setLastSeen(m.getLastSeen());
                            
                            UserProfile p = profileMap.get(m.getId());
                            if (p != null) {
                                String name = p.getFullName();
                                if (!hasPackage && !m.getId().equals(user.getId())) {
                                    name = obfuscateName(name);
                                    summary.setPhoneNumber(null);
                                    summary.setEmail(null);
                                    summary.setAvatar(null);
                                } else {
                                    summary.setPhoneNumber(p.getPhoneNumber());
                                    summary.setEmail(p.getEmail());
                                    summary.setAvatar(p.getProfileImageUrl());
                                }
                                summary.setName(name);
                            } else if (!hasPackage && !m.getId().equals(user.getId())) {
                                summary.setName(obfuscateName(m.getUsername()));
                            }
                            return summary;
                        }).collect(Collectors.toList()));

                    Message lastMsg = lastMessageMap.get(room.getId());
                    if (lastMsg != null) {
                        dto.setLastMessage(convertToDto(lastMsg, hasPackage, user.getId()));
                    }

                    dto.setUnreadCount(unreadCountMap.getOrDefault(room.getId(), 0));
                    return dto;
                }).collect(Collectors.toList());

        // Deduplicate by exact members
        Map<String, ChatRoomDto> uniqueRooms = new HashMap<>();
        for (ChatRoomDto room : rooms) {
            String memberKey = room.getMembers().stream()
                    .map(m -> String.valueOf(m.getId()))
                    .sorted()
                    .collect(Collectors.joining(","));

            if (uniqueRooms.containsKey(memberKey)) {
                ChatRoomDto existing = uniqueRooms.get(memberKey);
                if (room.getLastMessage() != null) {
                    if (existing.getLastMessage() == null
                            || room.getLastMessage().getCreatedAt().isAfter(existing.getLastMessage().getCreatedAt())) {
                        uniqueRooms.put(memberKey, room);
                    }
                }
            } else {
                uniqueRooms.put(memberKey, room);
            }
        }

        List<ChatRoomDto> finalRooms = new ArrayList<>(uniqueRooms.values());

        // Sort by last message time (newest first). Rooms without messages go to the
        // bottom.
        finalRooms.sort((r1, r2) -> {
            if (r1.getLastMessage() != null && r2.getLastMessage() != null) {
                return r2.getLastMessage().getCreatedAt().compareTo(r1.getLastMessage().getCreatedAt());
            } else if (r1.getLastMessage() != null) {
                return -1;
            } else if (r2.getLastMessage() != null) {
                return 1;
            } else {
                return r2.getId().compareTo(r1.getId());
            }
        });

        updateLastSeen(user);
        return ResponseEntity.ok(finalRooms);
    }

    @GetMapping("/history/{roomId}")
    public ResponseEntity<?> getChatHistory(@PathVariable("roomId") Long roomId, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();

        // Security check: is user a member?
        if (room.getMembers().stream().noneMatch(m -> m.getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body("Not a member of this chat");
        }

        List<Message> messages = messageRepository.findByChatRoomOrderByCreatedAtAsc(room);
        boolean hasPkg = user.getSubscriptionPackage() != null;
        
        // Find unread messages received by current user
        List<Message> unread = messages.stream()
                .filter(msg -> !msg.isRead() && msg.getSender() != null && !msg.getSender().getId().equals(user.getId()))
                .collect(Collectors.toList());

        if (!unread.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            unread.forEach(msg -> {
                msg.setRead(true);
                msg.setReadAt(now);
            });
            messageRepository.saveAll(unread);
            
            // Notify about read status
            for (Message msg : unread) {
                messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(msg, hasPkg, user.getId()));
            }
        }

        List<MessageDto> history = messages.stream()
                .map(msg -> convertToDto(msg, hasPkg, user.getId()))
                .collect(Collectors.toList());

        updateLastSeen(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/read")
    public ResponseEntity<?> markAsRead(@RequestBody Map<String, Object> payload, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        updateLastSeen(user);

        Object roomIdObj = payload.get("roomId");
        if (roomIdObj == null) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }
        Long roomId = Long.valueOf(roomIdObj.toString());
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();

        // Security check
        if (room.getMembers().stream().noneMatch(m -> m.getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body("Not a member of this chat");
        }

        List<Message> unreadMessages = messageRepository.findByChatRoomOrderByCreatedAtAsc(room).stream()
                .filter(msg -> !msg.isRead() && msg.getSender() != null
                        && !msg.getSender().getId().equals(user.getId()))
                .collect(Collectors.toList());

        if (!unreadMessages.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            unreadMessages.forEach(msg -> {
                msg.setRead(true);
                msg.setReadAt(now);
            });
            messageRepository.saveAll(unreadMessages);
            
            boolean hasPkg = user.getSubscriptionPackage() != null;
            for (Message msg : unreadMessages) {
                messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(msg, hasPkg, user.getId()));
            }
        }

        return ResponseEntity.ok(Map.of("message", "Marked " + unreadMessages.size() + " messages as read"));
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload, Authentication authentication) {
        User sender = userRepository.findByUsername(authentication.getName()).orElseThrow();

        Object roomIdObj = payload.get("roomId");
        if (roomIdObj == null) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }

        Long roomId;
        if (roomIdObj instanceof Number) {
            roomId = ((Number) roomIdObj).longValue();
        } else {
            roomId = Long.valueOf(roomIdObj.toString());
        }

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();

        // Security check
        if (room.getMembers().stream().noneMatch(m -> m.getId().equals(sender.getId()))) {
            return ResponseEntity.status(403).body("Not authorized to send messages to this room");
        }

        String content = payload.getOrDefault("content", "").toString();

        Message message = new Message();
        message.setSender(sender);
        message.setChatRoom(room);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        // If DIRECT chat, set the receiver as well
        if ("DIRECT".equals(room.getType())) {
            User receiver = room.getMembers().stream()
                    .filter(m -> !m.getId().equals(sender.getId()))
                    .findFirst().orElse(null);
            message.setReceiver(receiver);
        }

        messageRepository.save(message);

        // Create notifications for other members
        for (User member : room.getMembers()) {
            if (!member.getId().equals(sender.getId())) {
                Notification notif = new Notification();
                notif.setUser(member);
                notif.setTitle("New Message");
                notif.setMessage(sender.getUsername() + " sent a message in " + room.getName());
                notif.setType("SYSTEM");
                notif.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notif);
            }
        }

        updateLastSeen(sender);

        // Broadcast message to WebSocket topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(message, true, sender.getId()));

        return ResponseEntity.ok(convertToDto(message, true, sender.getId()));
    }

    private void updateLastSeen(User user) {
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }

    private MessageDto convertToDto(Message msg, boolean hasPackage, Long currentUserId) {
        MessageDto dto = new MessageDto();
        dto.setId(msg.getId());
        dto.setSenderId(msg.getSender().getId());
        if (msg.getChatRoom() != null) {
            dto.setChatRoomId(msg.getChatRoom().getId());
        }
        dto.setContent(msg.getContent());
        dto.setCreatedAt(msg.getCreatedAt());
        dto.setRead(msg.isRead());

        UserProfile senderProfile = profileRepository.findByUserId(msg.getSender().getId()).orElse(null);
        if (senderProfile != null) {
            String name = senderProfile.getFullName();
            if (!hasPackage && !msg.getSender().getId().equals(currentUserId)) {
                name = obfuscateName(name);
                dto.setSenderProfileImageUrl(null);
            } else {
                dto.setSenderProfileImageUrl(senderProfile.getProfileImageUrl());
            }
            dto.setSenderName(name);
        }

        return dto;
    }

    private String obfuscateName(String name) {
        if (name == null || name.length() <= 2) return name;
        return name.charAt(0) + "..." + name.charAt(name.length() - 1);
    }
}

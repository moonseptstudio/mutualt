package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.ChatRoom;
import com.moonseptstudio.mutualt.dto.ChatRoomDto;
import com.moonseptstudio.mutualt.repository.ChatRoomRepository;
import com.moonseptstudio.mutualt.dto.MessageDto;
import com.moonseptstudio.mutualt.model.Message;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.MessageRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
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
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/rooms")
    public ResponseEntity<?> getMyChatRooms(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<ChatRoomDto> rooms = chatRoomRepository.findByMember(user).stream()
                .map(room -> convertRoomToDto(room, user)).collect(Collectors.toList());

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

        List<MessageDto> history = messageRepository.findByChatRoomOrderByCreatedAtAsc(room).stream()
                .map(msg -> {
                    // Automatically mark as read if receiver is current user
                    if (!msg.isRead() && msg.getSender() != null && !msg.getSender().getId().equals(user.getId())) {
                        msg.setRead(true);
                        msg.setReadAt(LocalDateTime.now());
                        messageRepository.save(msg);
                        // Notify sender that message was read
                        messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(msg));
                    }
                    return convertToDto(msg);
                }).collect(Collectors.toList());

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

        for (Message msg : unreadMessages) {
            msg.setRead(true);
            msg.setReadAt(LocalDateTime.now());
            messageRepository.save(msg);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(msg));
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

        updateLastSeen(sender);

        // Broadcast message to WebSocket topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId, convertToDto(message));

        return ResponseEntity.ok(convertToDto(message));
    }

    private void updateLastSeen(User user) {
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }

    private MessageDto convertToDto(Message msg) {
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
            dto.setSenderName(senderProfile.getFullName());
        }

        return dto;
    }

    private ChatRoomDto convertRoomToDto(ChatRoom room, User currentUser) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setType(room.getType());
        dto.setMembers(room.getMembers().stream()
                .map(this::convertUserToSummaryDto).collect(Collectors.toList()));

        List<Message> messages = messageRepository.findByChatRoomOrderByCreatedAtAsc(room);
        if (!messages.isEmpty()) {
            dto.setLastMessage(convertToDto(messages.get(messages.size() - 1)));
        }

        dto.setUnreadCount((int) messageRepository.countByChatRoomAndIsReadFalseAndSenderNot(room, currentUser));

        return dto;
    }

    private ChatRoomDto.UserSummaryDto convertUserToSummaryDto(User user) {
        ChatRoomDto.UserSummaryDto summary = new ChatRoomDto.UserSummaryDto();
        summary.setId(user.getId());
        summary.setName(user.getUsername()); // Fallback
        summary.setLastSeen(user.getLastSeen());
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null) {
            summary.setName(profile.getFullName());
            summary.setPhoneNumber(profile.getPhoneNumber());
            summary.setEmail(profile.getEmail());
            // avatar logic if any
        }
        return summary;
    }
}

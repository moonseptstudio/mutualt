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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    MessageRepository messageRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository profileRepository;

    @Autowired
    ChatRoomRepository chatRoomRepository;

    @GetMapping("/rooms")
    public ResponseEntity<?> getMyChatRooms(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<ChatRoomDto> rooms = chatRoomRepository.findByMember(user).stream()
                .map(room -> convertRoomToDto(room)).collect(Collectors.toList());
        return ResponseEntity.ok(rooms);
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
                .map(this::convertToDto).collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload, Authentication authentication) {
        User sender = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Long roomId = Long.valueOf(payload.get("roomId").toString());
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();

        // Security check
        if (room.getMembers().stream().noneMatch(m -> m.getId().equals(sender.getId()))) {
            return ResponseEntity.status(403).body("Not authorized to send messages to this room");
        }

        String content = payload.get("content").toString();

        Message message = new Message();
        message.setSender(sender);
        message.setChatRoom(room);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        messageRepository.save(message);
        return ResponseEntity.ok(convertToDto(message));
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

    private ChatRoomDto convertRoomToDto(ChatRoom room) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setType(room.getType());
        dto.setMembers(room.getMembers().stream().map(this::convertUserToSummary).collect(Collectors.toList()));
        return dto;
    }

    private ChatRoomDto.UserSummaryDto convertUserToSummary(User user) {
        ChatRoomDto.UserSummaryDto summary = new ChatRoomDto.UserSummaryDto();
        summary.setId(user.getId());
        summary.setName(user.getUsername()); // Fallback
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

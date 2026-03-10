package com.moonseptstudio.mutualt.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRoomDto {
    private Long id;
    private String name;
    private String type; // DIRECT, GROUP
    private List<UserSummaryDto> members;
    private MessageDto lastMessage;
    private int unreadCount;

    @Data
    public static class UserSummaryDto {
        private Long id;
        private String name;
        private String avatar;
        private String phoneNumber;
        private String email;
        private java.time.LocalDateTime lastSeen;
    }
}

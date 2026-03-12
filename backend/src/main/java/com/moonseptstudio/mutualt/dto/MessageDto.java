package com.moonseptstudio.mutualt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Long chatRoomId;
    private String content;
    private String senderProfileImageUrl;
    private LocalDateTime createdAt;
    private boolean isRead;
}

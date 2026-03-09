package com.moonseptstudio.mutualt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MatchRequestDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderStationName;
    private Long receiverId;
    private String receiverName;
    private String receiverStationName;
    private String status;
    private String matchType;
    private String cycleUserIds;
    private LocalDateTime createdAt;

    // Contact info - populated if status is ACCEPTED
    private String senderPhone;
    private String senderEmail;
    private String receiverPhone;
    private String receiverEmail;
}

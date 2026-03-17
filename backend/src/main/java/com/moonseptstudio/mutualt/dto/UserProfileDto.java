package com.moonseptstudio.mutualt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class UserProfileDto {
    private String fullName;
    private String username;
    private String email;
    private String nic;
    private Long fieldId;
    private String fieldName;
    private String jobCategoryName;
    private Long currentStationId;
    private String currentStationName;
    private String currentStationDistrict;
    private String phoneNumber;
    private Integer verificationLevel;

    private String biometricsStatus;
    private String profileImageUrl;
    private String packageName;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private java.time.LocalDateTime subscriptionEndDate;
}

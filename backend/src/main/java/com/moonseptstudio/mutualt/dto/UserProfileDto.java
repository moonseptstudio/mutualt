package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private String fullName;
    private String username;
    private String email;
    private String nic;
    private String jobCategoryName;
    private String gradeName;
    private Long currentStationId;
    private String currentStationName;
    private String currentStationDistrict;
    private String phoneNumber;
    private Integer verificationLevel;
    private String serviceLetterStatus;
    private String biometricsStatus;
    private String profileImageUrl;
    private String serviceLetterUrl;
    private String packageName;
}

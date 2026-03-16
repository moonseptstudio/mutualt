package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String nic;
    private Long jobCategoryId;
    private Long gradeId;
    private Long currentStationId;
    private String phoneNumber;
}

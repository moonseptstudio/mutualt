package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String phoneNumber;
    private String otpCode;
    private String newPassword;
}

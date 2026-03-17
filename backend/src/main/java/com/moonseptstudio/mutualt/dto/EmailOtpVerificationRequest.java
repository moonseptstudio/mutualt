package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class EmailOtpVerificationRequest {
    private String email;
    private String otpCode;
}

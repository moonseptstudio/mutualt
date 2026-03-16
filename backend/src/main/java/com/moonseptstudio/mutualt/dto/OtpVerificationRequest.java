package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class OtpVerificationRequest {
    private String phoneNumber;
    private String otpCode;
}

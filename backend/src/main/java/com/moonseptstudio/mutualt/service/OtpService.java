package com.moonseptstudio.mutualt.service;

import com.moonseptstudio.mutualt.model.OtpToken;
import com.moonseptstudio.mutualt.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private SmsService smsService;

    private static final int OTP_EXPIRY_MINUTES = 10;

    @Transactional
    public void generateAndSendOtp(String phoneNumber, String type) {
        // 1. Generate 6 digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        // 2. Delete existing tokens for this number and type
        otpTokenRepository.deleteByPhoneNumberAndType(phoneNumber, type);

        // 3. Save new token
        OtpToken token = new OtpToken();
        token.setPhoneNumber(phoneNumber);
        token.setOtpCode(otpCode);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        token.setType(type);
        otpTokenRepository.save(token);

        // 4. Send SMS
        String message = "Your MutualT OTP code is: " + otpCode + ". Valid for " + OTP_EXPIRY_MINUTES + " minutes.";
        smsService.sendSms(phoneNumber, message);
    }

    public boolean validateOtp(String phoneNumber, String otpCode, String type) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByPhoneNumberAndOtpCodeAndType(phoneNumber, otpCode, type);

        if (tokenOpt.isPresent()) {
            OtpToken token = tokenOpt.get();
            if (token.getExpiryTime().isAfter(LocalDateTime.now())) {
                otpTokenRepository.delete(token);
                return true;
            }
        }
        return false;
    }
}

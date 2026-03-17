package com.moonseptstudio.mutualt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("kavinda@moonsept.com");
        message.setTo(to);
        message.setSubject("MutualT - Email Verification Code");
        message.setText("Your MutualT verification code is: " + otpCode + "\n\nThis code will expire in 10 minutes.");
        
        mailSender.send(message);
    }
}

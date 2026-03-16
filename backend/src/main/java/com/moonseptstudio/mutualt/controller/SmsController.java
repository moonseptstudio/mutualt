package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/send-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendTestSms(@RequestBody Map<String, String> request) {
        String recipient = request.get("recipient");
        String message = request.get("message");
        String senderId = request.get("senderId");

        if (recipient == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Recipient and message are required"));
        }

        Map<String, Object> response = smsService.sendSms(recipient, message, senderId);
        return ResponseEntity.ok(response);
    }
}

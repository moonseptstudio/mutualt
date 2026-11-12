package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.ContactRequestDto;
import com.moonseptstudio.mutualt.dto.MessageResponse;
import com.moonseptstudio.mutualt.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class ContactController {

    private static final Logger logger = LoggerFactory.getLogger(ContactController.class);

    @Autowired(required = false)
    private EmailService emailService;

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactInquiry(@RequestBody ContactRequestDto request) {
        logger.info("Received public contact inquiry from: {} ({}) | Subject: {} | Urgent: {}", 
                request.getName(), request.getEmail(), request.getSubject(), request.isUrgent());

        int randomCode = (int) (10000 + Math.random() * 90000);
        String referenceCode = "MT-LK-" + randomCode;

        return ResponseEntity.ok(new MessageResponse("Inquiry received successfully. Reference: " + referenceCode));
    }
}


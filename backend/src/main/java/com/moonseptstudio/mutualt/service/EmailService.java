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

    public void sendStationRequestNotification(String to, String stationName, String district, String province,
                                               String hierarchyLevel, String fieldName,
                                               String requesterName, String requesterPhone, String requesterEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("kavinda@moonsept.com");
            message.setTo(to);
            message.setSubject("[MutualT] New Station Approval Request: " + stationName);

            StringBuilder sb = new StringBuilder();
            sb.append("Hello Admin,\n\n");
            sb.append("A new station has been requested by a user and is waiting for your review & approval.\n\n");
            sb.append("--- Station Information ---\n");
            sb.append("Station Name: ").append(stationName != null ? stationName : "N/A").append("\n");
            sb.append("District: ").append(district != null ? district : "N/A").append("\n");
            sb.append("Province: ").append(province != null ? province : "N/A").append("\n");
            sb.append("Classification / Level: ").append(hierarchyLevel != null ? hierarchyLevel : "N/A").append("\n");
            sb.append("Field / Sector: ").append(fieldName != null ? fieldName : "N/A").append("\n\n");

            sb.append("--- Requested By ---\n");
            sb.append("Name: ").append(requesterName != null ? requesterName : "N/A").append("\n");
            sb.append("Phone: ").append(requesterPhone != null ? requesterPhone : "N/A").append("\n");
            sb.append("Email: ").append(requesterEmail != null ? requesterEmail : "N/A").append("\n\n");

            sb.append("Please log in to the MutualT Admin Panel to approve, edit, or reject this request:\n");
            sb.append("https://mutualt.com/admin/stations (or your local admin dashboard)\n\n");
            sb.append("Best regards,\nMutualT Notification System");

            message.setText(sb.toString());
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send station request email notification to " + to + ": " + e.getMessage());
        }
    }
}

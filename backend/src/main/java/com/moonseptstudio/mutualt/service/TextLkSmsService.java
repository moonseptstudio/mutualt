package com.moonseptstudio.mutualt.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TextLkSmsService implements SmsService {

    private final RestTemplate restTemplate;

    @Value("${textlk.api.token}")
    private String apiToken;

    @Value("${textlk.api.senderId}")
    private String defaultSenderId;

    private static final String API_URL = "https://app.text.lk/api/http/sms/send";

    public TextLkSmsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Map<String, Object> sendSms(String recipient, String message) {
        return sendSms(recipient, message, defaultSenderId);
    }

    @Override
    public Map<String, Object> sendSms(String recipient, String message, String senderId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, String> body = new HashMap<>();
        body.put("api_token", apiToken);
        body.put("recipient", recipient);
        body.put("sender_id", senderId != null ? senderId : defaultSenderId);
        body.put("type", "plain");
        body.put("message", message);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> rawResponse = restTemplate.postForEntity(API_URL, entity, Map.class);
            if (rawResponse.getStatusCode() == HttpStatus.OK) {
                @SuppressWarnings("unchecked")
                Map<String, Object> bodyResponse = (Map<String, Object>) rawResponse.getBody();
                return bodyResponse;
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "HTTP Status: " + rawResponse.getStatusCode());
                return error;
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return error;
        }
    }
}

package com.moonseptstudio.mutualt.service;

import java.util.Map;

public interface SmsService {
    Map<String, Object> sendSms(String recipient, String message);
    Map<String, Object> sendSms(String recipient, String message, String senderId);
}

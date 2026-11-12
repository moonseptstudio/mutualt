package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class ContactRequestDto {
    private String name;
    private String email;
    private String phone;
    private String sector;
    private String subject;
    private String message;
    private boolean urgent;
}


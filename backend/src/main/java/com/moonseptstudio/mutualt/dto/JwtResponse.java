package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String role;

    public JwtResponse(String token, Long id, String username, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
    }
}

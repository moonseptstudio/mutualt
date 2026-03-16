package com.moonseptstudio.mutualt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private Long id;
    private String username;
    private String fullName;
    private String role;
    private String packageName;
    private boolean verified;
    private LocalDateTime lastSeen;
}

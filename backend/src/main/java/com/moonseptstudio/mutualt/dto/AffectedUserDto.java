package com.moonseptstudio.mutualt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffectedUserDto {
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String nic;
    private String relationType; // "CURRENT_STATION" or "PREFERENCE"
}


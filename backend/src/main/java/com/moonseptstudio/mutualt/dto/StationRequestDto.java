package com.moonseptstudio.mutualt.dto;

import lombok.Data;

@Data
public class StationRequestDto {
    private String name;
    private String district;
    private String province;
    private String hierarchyLevel;
    private Long fieldId;
    private String requestedByName;
    private String requestedByPhone;
    private String requestedByEmail;
}


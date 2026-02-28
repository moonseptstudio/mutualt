package com.moonseptstudio.mutualt.dto;

import lombok.Data;
import java.util.List;

@Data
public class MatchDto {
    private String type; // "Direct" or "Triple"
    private List<UserSummaryDto> participants;

    @Data
    public static class UserSummaryDto {
        private Long userId;
        private String name;
        private String stationName;
        private String stationDistrict;
    }
}

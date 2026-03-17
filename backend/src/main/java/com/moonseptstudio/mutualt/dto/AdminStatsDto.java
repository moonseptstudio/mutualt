package com.moonseptstudio.mutualt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private Long totalUsers;
    private Long activePremiumUsers;
    private Long pendingVerifications;
    private Long totalMatchRequests;
    private Double systemLoad; // Percentage
    private List<DailyActivity> recentActivity;
    private List<SystemEvent> systemEvents;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyActivity {
        private String day;
        private Integer value;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SystemEvent {
        private String time;
        private String icon;
        private String type;
        private String msg;
        private String color;
    }
}

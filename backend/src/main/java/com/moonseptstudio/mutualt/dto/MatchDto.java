package com.moonseptstudio.mutualt.dto;

import lombok.Data;
import java.util.List;

@Data
public class MatchDto {
    private String type; // "Direct" or "Triple"
    private List<UserSummaryDto> participants;

    public static class UserSummaryDto {
        private Long userId;
        private String name;
        private String stationName;
        private String stationDistrict;
        private String profileImageUrl;
        private String requestStatus; // PENDING, ACCEPTED, etc.
        private Long requestId;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStationName() {
            return stationName;
        }

        public void setStationName(String stationName) {
            this.stationName = stationName;
        }

        public String getStationDistrict() {
            return stationDistrict;
        }

        public void setStationDistrict(String stationDistrict) {
            this.stationDistrict = stationDistrict;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }

        public String getRequestStatus() {
            return requestStatus;
        }

        public void setRequestStatus(String requestStatus) {
            this.requestStatus = requestStatus;
        }

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }
    }
}

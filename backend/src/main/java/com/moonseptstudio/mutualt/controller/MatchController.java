package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.MatchDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.service.MatchingEngineService;
import com.moonseptstudio.mutualt.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    MatchingEngineService matchingEngineService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @Autowired
    PackageService packageService;

    @Autowired
    com.moonseptstudio.mutualt.repository.MatchRequestRepository matchRequestRepository;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(MatchController.class);

    @GetMapping
    public List<MatchDto> getMatches(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        if (profile.getJobCategory() == null || profile.getGrade() == null) {
            logger.warn("User {} has no job category or grade set", authentication.getName());
            return List.of();
        }

        List<List<Long>> cycles = matchingEngineService.findCycles(profile.getJobCategory().getId(),
                profile.getGrade().getId(), profile.getUser().getId());

        logger.info("Found {} cycles for user {}", cycles.size(), authentication.getName());

        return cycles.stream().map(cycle -> {
            MatchDto dto = new MatchDto();
            dto.setType(cycle.size() == 2 ? "Direct" : "Triple");
            dto.setParticipants(
                    cycle.stream().map(uid -> toSummaryDto(uid, user.getId())).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/all")
    public List<MatchDto> getAllSystemCycles() {
        // Find all cycles for Doctors (Category 1) as a baseline
        List<List<Long>> cycles = matchingEngineService.findCycles(1L, 1L, 0L);

        return cycles.stream().map(cycle -> {
            MatchDto dto = new MatchDto();
            dto.setType(cycle.size() + "-Way");
            dto.setParticipants(cycle.stream().map(this::toSummaryDto).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    private MatchDto.UserSummaryDto toSummaryDto(Long uid, Long currentUserId) {
        UserProfile up = userProfileRepository.findByUserId(uid).orElseThrow();
        MatchDto.UserSummaryDto uDto = new MatchDto.UserSummaryDto();
        uDto.setUserId(uid);
        uDto.setName(up.getFullName());
        if (up.getCurrentStation() != null) {
            uDto.setStationName(up.getCurrentStation().getName());
            uDto.setStationDistrict(up.getCurrentStation().getDistrict());
        } else {
            uDto.setStationName("Unknown Station");
            uDto.setStationDistrict("Unknown District");
        }

        // Check if there's a request between current user and this participant
        if (!uid.equals(currentUserId)) {
            matchRequestRepository.findBySenderIdAndReceiverId(currentUserId, uid)
                    .stream().findFirst().ifPresent(req -> {
                        uDto.setRequestStatus(req.getStatus());
                        uDto.setRequestId(req.getId());
                    });

            // Also check incoming if outgoing not found or just for completeness
            if (uDto.getRequestStatus() == null) {
                matchRequestRepository.findBySenderIdAndReceiverId(uid, currentUserId)
                        .stream().findFirst().ifPresent(req -> {
                            uDto.setRequestStatus(req.getStatus() + "_INCOMING");
                            uDto.setRequestId(req.getId());
                        });
            }
        }

        return uDto;
    }

    private MatchDto.UserSummaryDto toSummaryDto(Long uid) {
        return toSummaryDto(uid, 0L);
    }
}

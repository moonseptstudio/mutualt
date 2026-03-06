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

    @GetMapping
    public List<MatchDto> getMatches(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        List<List<Long>> cycles = matchingEngineService.findCycles(profile.getJobCategory().getId(),
                profile.getGrade().getId(), profile.getUser().getId());

        return cycles.stream().map(cycle -> {
            MatchDto dto = new MatchDto();
            dto.setType(cycle.size() == 2 ? "Direct" : "Triple");
            dto.setParticipants(cycle.stream().map(this::toSummaryDto).collect(Collectors.toList()));
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

    private MatchDto.UserSummaryDto toSummaryDto(Long uid) {
        UserProfile up = userProfileRepository.findByUserId(uid).orElseThrow();
        MatchDto.UserSummaryDto uDto = new MatchDto.UserSummaryDto();
        uDto.setUserId(uid);
        uDto.setName(up.getFullName());
        uDto.setStationName(up.getCurrentStation().getName());
        uDto.setStationDistrict(up.getCurrentStation().getDistrict());
        return uDto;
    }
}

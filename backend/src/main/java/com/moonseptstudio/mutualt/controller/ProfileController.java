package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.UserProfileDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @GetMapping("/me")
    public UserProfileDto getCurrentProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        UserProfileDto dto = new UserProfileDto();
        dto.setFullName(profile.getFullName());
        dto.setUsername(user.getUsername());
        dto.setEmail(profile.getEmail());
        dto.setNic(profile.getNic());
        dto.setJobCategoryName(profile.getJobCategory().getName());
        dto.setGradeName(profile.getGrade().getName());
        dto.setCurrentStationName(profile.getCurrentStation().getName());
        dto.setCurrentStationDistrict(profile.getCurrentStation().getDistrict());

        return dto;
    }
}

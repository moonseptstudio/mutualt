package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.UserProfileDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        dto.setJobCategoryName(profile.getJobCategory() != null ? profile.getJobCategory().getName() : null);
        dto.setGradeName(profile.getGrade() != null ? profile.getGrade().getName() : null);

        if (profile.getCurrentStation() != null) {
            dto.setCurrentStationId(profile.getCurrentStation().getId());
            dto.setCurrentStationName(profile.getCurrentStation().getName());
            dto.setCurrentStationDistrict(profile.getCurrentStation().getDistrict());
        }

        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setVerificationLevel(profile.getVerificationLevel());
        dto.setServiceLetterStatus(profile.getServiceLetterStatus());
        dto.setBiometricsStatus(profile.getBiometricsStatus());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setServiceLetterUrl(profile.getServiceLetterUrl());
        dto.setPackageName(user.getSubscriptionPackage() != null ? user.getSubscriptionPackage().getName() : null);

        return dto;
    }

    @PutMapping("/me")
    public UserProfileDto updateProfile(@RequestBody UserProfileDto updateDto, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        if (updateDto.getEmail() != null) {
            profile.setEmail(updateDto.getEmail());
        }
        if (updateDto.getPhoneNumber() != null) {
            profile.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(updateDto.getProfileImageUrl());
        }

        userProfileRepository.save(profile);
        return getCurrentProfile(authentication);
    }

    @PutMapping("/submit-doc/{docType}")
    public UserProfileDto submitDocument(@PathVariable("docType") String docType, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        if ("serviceLetter".equalsIgnoreCase(docType)) {
            profile.setServiceLetterStatus("REVIEWING");
            profile.setVerificationLevel(2); // Bump level on submission
        } else if ("biometrics".equalsIgnoreCase(docType)) {
            profile.setBiometricsStatus("COMPLETED");
            profile.setVerificationLevel(3); // Bump level on biometric completion
        }

        userProfileRepository.save(profile);
        return getCurrentProfile(authentication);
    }
}

package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.UserProfileDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.util.PhoneUtils;
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
        
        if (profile.getJobCategory() != null) {
            dto.setJobCategoryName(profile.getJobCategory().getName());
            if (profile.getJobCategory().getField() != null) {
                dto.setFieldId(profile.getJobCategory().getField().getId());
                dto.setFieldName(profile.getJobCategory().getField().getName());
            }
        }
        
        
        if (profile.getCurrentStation() != null) {
            dto.setCurrentStationId(profile.getCurrentStation().getId());
            dto.setCurrentStationName(profile.getCurrentStation().getName());
            dto.setCurrentStationDistrict(profile.getCurrentStation().getDistrict());
        }

        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setVerificationLevel(profile.getVerificationLevel());
        dto.setBiometricsStatus(profile.getBiometricsStatus());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setPackageName(user.getSubscriptionPackage() != null ? user.getSubscriptionPackage().getName() : null);
        dto.setSubscriptionEndDate(user.getSubscriptionEndDate());

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
            String normalized = PhoneUtils.normalize(updateDto.getPhoneNumber());
            if (normalized == null) {
                throw new RuntimeException("Invalid phone number format! Please use +94 7XXXXXXXX.");
            }
            profile.setPhoneNumber(normalized);
        }

        userProfileRepository.save(profile);
        return getCurrentProfile(authentication);
    }

    @PutMapping("/submit-doc/{docType}")
    public UserProfileDto submitDocument(@PathVariable("docType") String docType, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        if ("biometrics".equalsIgnoreCase(docType)) {
            profile.setBiometricsStatus("COMPLETED");
            profile.setVerificationLevel(2); // Bump to level 2 on biometric completion
        }

        userProfileRepository.save(profile);
        return getCurrentProfile(authentication);
    }
}

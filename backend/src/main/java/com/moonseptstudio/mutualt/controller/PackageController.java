package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private PackageService packageService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/buy")
    public ResponseEntity<?> buyPremium(Authentication authentication, @org.springframework.web.bind.annotation.RequestBody Map<String, Integer> payload) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        int durationMonths = payload.getOrDefault("duration", 1);
        packageService.upgradeUserToPremium(user.getId(), durationMonths);
        return ResponseEntity.ok(Map.of(
            "message", "Upgraded successfully", 
            "packageName", "PREMIUM",
            "duration", durationMonths
        ));
    }
}

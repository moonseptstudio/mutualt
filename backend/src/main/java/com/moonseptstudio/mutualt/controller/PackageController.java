package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.TrialStatusDto;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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

    /** Where this account stands on its free trial: eligible, running, used up or missed. */
    @GetMapping("/trial")
    public ResponseEntity<?> getTrialStatus(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(packageService.getTrialStatus(user.getId()));
    }

    /** Claims the free trial. No payment, no card details. */
    @PostMapping("/trial/claim")
    public ResponseEntity<?> claimFreeTrial(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        try {
            TrialStatusDto status = packageService.claimFreeTrial(user.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Free trial activated",
                    "packageName", "PREMIUM",
                    "trial", status
            ));
        } catch (PackageService.TrialNotAvailableException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", e.getCode(),
                    "message", e.getMessage()
            ));
        }
    }
}

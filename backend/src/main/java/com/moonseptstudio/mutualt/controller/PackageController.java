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
    public ResponseEntity<?> buyPremium(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        packageService.upgradeUserToPremium(user.getId());
        return ResponseEntity.ok(Map.of("message", "Upgraded successfully", "packageName", "PREMIUM"));
    }
}

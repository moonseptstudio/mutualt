package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class PingController {

    @Autowired
    UserRepository userRepository;

    @PostMapping("/ping")
    public ResponseEntity<?> ping(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            userRepository.findByUsername(authentication.getName()).ifPresent(user -> {
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
            });
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}

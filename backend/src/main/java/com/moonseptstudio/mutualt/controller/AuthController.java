package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.JwtResponse;
import com.moonseptstudio.mutualt.dto.LoginRequest;
import com.moonseptstudio.mutualt.dto.MessageResponse;
import com.moonseptstudio.mutualt.dto.PasswordChangeRequest;
import com.moonseptstudio.mutualt.dto.SignupRequest;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.model.SubscriptionPackage;
import com.moonseptstudio.mutualt.repository.*;
import com.moonseptstudio.mutualt.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StationRepository stationRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserProfileRepository userProfileRepository;

    @Autowired
    JobCategoryRepository jobCategoryRepository;

    @Autowired
    GradeRepository gradeRepository;

    @Autowired
    PackageRepository packageRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

        return ResponseEntity.ok(new JwtResponse(jwt,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getSubscriptionPackage() != null ? user.getSubscriptionPackage().getName() : null));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username (NIC) is already taken!"));
        }

        // 1. Create User
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPasswordHash(encoder.encode(signUpRequest.getPassword()));
        user.setRole("USER");
        
        SubscriptionPackage freePackage = packageRepository.findByName("FREE").orElse(null);
        user.setSubscriptionPackage(freePackage);
        
        userRepository.save(user);

        // 2. Create Profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFullName(signUpRequest.getFullName());
        profile.setNic(signUpRequest.getNic());
        profile.setEmail(signUpRequest.getEmail());

        profile.setJobCategory(jobCategoryRepository.findById(signUpRequest.getJobCategoryId()).orElse(null));
        profile.setGrade(gradeRepository.findById(signUpRequest.getGradeId()).orElse(null));
        profile.setCurrentStation(stationRepository.findById(signUpRequest.getCurrentStationId()).orElse(null));

        userProfileRepository.save(profile);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Not authenticated"));
        }
        
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        return ResponseEntity.ok(new JwtResponse(
                null, // No need to return token again
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getSubscriptionPackage() != null ? user.getSubscriptionPackage().getName() : null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        if (!encoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Incorrect old password!"));
        }
        
        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
}

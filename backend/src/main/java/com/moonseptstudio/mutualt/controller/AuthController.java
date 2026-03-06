package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.JwtResponse;
import com.moonseptstudio.mutualt.dto.LoginRequest;
import com.moonseptstudio.mutualt.dto.MessageResponse;
import com.moonseptstudio.mutualt.dto.SignupRequest;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.GradeRepository;
import com.moonseptstudio.mutualt.repository.JobCategoryRepository;
import com.moonseptstudio.mutualt.repository.StationRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
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
                user.getRole()));
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
}

package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.dto.*;
import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.model.SubscriptionPackage;
import com.moonseptstudio.mutualt.repository.*;
import com.moonseptstudio.mutualt.security.JwtUtils;
import com.moonseptstudio.mutualt.service.OtpService;
import com.moonseptstudio.mutualt.util.PhoneUtils;
import com.moonseptstudio.mutualt.util.NicUtils;
import com.moonseptstudio.mutualt.model.PendingUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
    PackageRepository packageRepository;

    @Autowired
    OtpService otpService;

    @Autowired
    PendingUserRepository pendingUserRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        if (!userRepository.existsByUsername(loginRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("This NIC is not Registered"));
        }

        try {
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
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Incorrect Password"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username (NIC) is already taken!"));
        }

        if (!NicUtils.isValid(signUpRequest.getNic())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid NIC format! Please use 9 digits + V/v or 12 digits."));
        }

        // If it exists in pending_users, we'll just overwrite it (delete old one first)
        pendingUserRepository.findByUsername(signUpRequest.getUsername())
                .ifPresent(pendingUserRepository::delete);

        String normalizedPhone = PhoneUtils.normalize(signUpRequest.getPhoneNumber());
        if (normalizedPhone == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid phone number format! Please use +94 7XXXXXXXX."));
        }

        // Save to PendingUser instead of User/UserProfile
        PendingUser pendingUser = new PendingUser();
        pendingUser.setUsername(signUpRequest.getUsername());
        pendingUser.setPasswordHash(encoder.encode(signUpRequest.getPassword()));
        pendingUser.setFullName(signUpRequest.getFullName());
        pendingUser.setEmail(signUpRequest.getEmail());
        pendingUser.setNic(signUpRequest.getNic());
        pendingUser.setPhoneNumber(normalizedPhone);
        pendingUser.setJobCategoryId(signUpRequest.getJobCategoryId());
        pendingUser.setCurrentStationId(signUpRequest.getCurrentStationId());

        pendingUserRepository.save(pendingUser);

        // 3. Trigger Registration OTP (Phone only)
        try {
            otpService.generateAndSendOtp(normalizedPhone, "REGISTRATION");
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Error sending registration OTP: " + e.getMessage());
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please verify your phone number."));
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

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@RequestBody OtpVerificationRequest request) {
        String normalizedPhone = PhoneUtils.normalize(request.getPhoneNumber());
        if (normalizedPhone == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid phone number format!"));
        }

        if (otpService.validateOtp(normalizedPhone, request.getOtpCode(), "REGISTRATION")) {
            PendingUser pendingUser = pendingUserRepository.findByPhoneNumber(normalizedPhone)
                    .orElseThrow(() -> new RuntimeException("Error: Pending registration not found!"));

            // 1. Create User
            User user = new User();
            user.setUsername(pendingUser.getUsername());
            user.setPasswordHash(pendingUser.getPasswordHash());
            user.setRole("USER");
            user.setVerified(true);
            
            SubscriptionPackage freePackage = packageRepository.findByName("FREE").orElse(null);
            user.setSubscriptionPackage(freePackage);
            
            userRepository.save(user);

            // 2. Create Profile
            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setFullName(pendingUser.getFullName());
            profile.setNic(pendingUser.getNic());
            profile.setEmail(pendingUser.getEmail());
            profile.setPhoneNumber(pendingUser.getPhoneNumber());

            profile.setJobCategory(jobCategoryRepository.findById(pendingUser.getJobCategoryId()).orElse(null));
            profile.setCurrentStation(stationRepository.findById(pendingUser.getCurrentStationId()).orElse(null));

            userProfileRepository.save(profile);

            // 3. Delete PendingUser
            pendingUserRepository.delete(pendingUser);

            return ResponseEntity.ok(new MessageResponse("Account verified and created successfully!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired OTP!"));
    }

    @GetMapping("/phone-hint")
    public ResponseEntity<?> getPhoneHint(@RequestParam String nic) {
        return userRepository.findByUsername(nic)
                .map(user -> userProfileRepository.findByUserId(user.getId())
                        .map(profile -> {
                            String phone = profile.getPhoneNumber();
                            String hint = (phone != null && phone.length() >= 2) 
                                    ? phone.substring(phone.length() - 2) 
                                    : "??";
                            return ResponseEntity.ok(new MessageResponse(hint));
                        })
                        .orElse(ResponseEntity.badRequest().body(new MessageResponse("Profile not found"))))
                .orElse(ResponseEntity.badRequest().body(new MessageResponse("User not found")));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String normalizedPhone = PhoneUtils.normalize(request.getPhoneNumber());
        if (normalizedPhone == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid phone number format!"));
        }

        UserProfile profile = userProfileRepository.findByPhoneNumber(normalizedPhone).orElse(null);
        if (profile == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number not found!"));
        }

        try {
            otpService.generateAndSendOtp(normalizedPhone, "PASSWORD_RESET");
            return ResponseEntity.ok(new MessageResponse("OTP sent to your phone number."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error sending OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String normalizedPhone = PhoneUtils.normalize(request.getPhoneNumber());
        if (normalizedPhone == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid phone number format!"));
        }

        if (otpService.validateOtp(normalizedPhone, request.getOtpCode(), "PASSWORD_RESET")) {
            UserProfile profile = userProfileRepository.findByPhoneNumber(normalizedPhone).orElseThrow();
            User user = profile.getUser();
            user.setPasswordHash(encoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired OTP!"));
    }
}

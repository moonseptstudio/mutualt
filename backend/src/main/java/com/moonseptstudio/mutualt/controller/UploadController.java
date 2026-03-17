package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import com.moonseptstudio.mutualt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final String uploadDir = "uploads";

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @PostMapping("/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file, Authentication authentication)
            throws IOException {
        String fileName = saveFile(file, "avatars");
        String fileUrl = "/api/public/files/" + fileName;

        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();
        profile.setProfileImageUrl(fileUrl);
        userProfileRepository.save(profile);

        return ResponseEntity.ok(fileUrl);
    }


    private String saveFile(MultipartFile file, String subDir) throws IOException {
        Path root = Paths.get(uploadDir, subDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String extension = "";
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = subDir + "/" + UUID.randomUUID().toString() + extension;
        Files.copy(file.getInputStream(), Paths.get(uploadDir, fileName));
        return fileName;
    }
}

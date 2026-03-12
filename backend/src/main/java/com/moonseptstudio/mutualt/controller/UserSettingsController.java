package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.User;
import com.moonseptstudio.mutualt.model.UserSettings;
import com.moonseptstudio.mutualt.repository.UserRepository;
import com.moonseptstudio.mutualt.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserSettingsRepository userSettingsRepository;

    @GetMapping
    public UserSettings getSettings(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(user);
                    return userSettingsRepository.save(newSettings);
                });
    }

    @PutMapping
    public UserSettings updateSettings(@RequestBody UserSettings updatedSettings, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(user);
                    return newSettings;
                });

        if (updatedSettings.getInstantMatchAlerts() != null)
            settings.setInstantMatchAlerts(updatedSettings.getInstantMatchAlerts());
        if (updatedSettings.getCycleDetectionAlerts() != null)
            settings.setCycleDetectionAlerts(updatedSettings.getCycleDetectionAlerts());
        if (updatedSettings.getSystemUpdatesAlerts() != null)
            settings.setSystemUpdatesAlerts(updatedSettings.getSystemUpdatesAlerts());
        if (updatedSettings.getPublicProfile() != null)
            settings.setPublicProfile(updatedSettings.getPublicProfile());
        if (updatedSettings.getRegionalDiscovery() != null)
            settings.setRegionalDiscovery(updatedSettings.getRegionalDiscovery());
        if (updatedSettings.getDarkMode() != null)
            settings.setDarkMode(updatedSettings.getDarkMode());
        if (updatedSettings.getTwoFactorEnabled() != null)
            settings.setTwoFactorEnabled(updatedSettings.getTwoFactorEnabled());

        return userSettingsRepository.save(settings);
    }
}

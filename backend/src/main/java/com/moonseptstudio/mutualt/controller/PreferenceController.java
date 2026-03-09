package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/preferences")
public class PreferenceController {

    @Autowired
    TransferPreferenceRepository preferenceRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StationRepository stationRepository;

    @GetMapping
    public List<TransferPreference> getMyPreferences(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return preferenceRepository.findByUserIdOrderByPriorityAsc(user.getId());
    }

    @PostMapping
    public ResponseEntity<?> addPreference(@RequestBody Map<String, Long> payload, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Station station = stationRepository.findById(payload.get("stationId")).orElseThrow();

        TransferPreference pref = new TransferPreference();
        pref.setUser(user);
        pref.setPreferredStation(station);

        List<TransferPreference> existing = preferenceRepository.findByUserIdOrderByPriorityAsc(user.getId());
        pref.setPriority(existing.size() + 1);

        preferenceRepository.save(pref);
        return ResponseEntity.ok(pref);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removePreference(@PathVariable("id") Long id) {
        preferenceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<?> reorderPreferences(@RequestBody List<Long> preferenceIds, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<TransferPreference> userPrefs = preferenceRepository.findByUserIdOrderByPriorityAsc(user.getId());

        // Validate that all submitted IDs belong to the user
        for (Long id : preferenceIds) {
            boolean ownsPref = userPrefs.stream().anyMatch(p -> p.getId().equals(id));
            if (!ownsPref) {
                return ResponseEntity.badRequest().body("Invalid preference ID: " + id);
            }
        }

        // Update priorities based on index in array
        for (int i = 0; i < preferenceIds.size(); i++) {
            Long prefId = preferenceIds.get(i);
            TransferPreference pref = preferenceRepository.findById(prefId).orElseThrow();
            pref.setPriority(i + 1);
            preferenceRepository.save(pref);
        }

        return ResponseEntity.ok().build();
    }
}

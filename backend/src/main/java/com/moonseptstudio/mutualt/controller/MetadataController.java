package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import com.moonseptstudio.mutualt.service.EmailService;
import com.moonseptstudio.mutualt.service.SmsService;
import com.moonseptstudio.mutualt.dto.StationRequestDto;
import com.moonseptstudio.mutualt.dto.StationRejectionDto;
import com.moonseptstudio.mutualt.dto.AffectedUserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class MetadataController {

    @Autowired
    FieldRepository fieldRepository;

    @Autowired
    JobCategoryRepository jobCategoryRepository;

    @Autowired
    StationRepository stationRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @Autowired
    TransferPreferenceRepository transferPreferenceRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    SmsService smsService;

    @GetMapping("/fields")
    public List<Field> getFields() {
        return fieldRepository.findAll();
    }

    @PostMapping("/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public Field createField(@RequestBody Field field) {
        return fieldRepository.save(field);
    }

    @Transactional
    @DeleteMapping("/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> deleteField(@PathVariable Long id) {
        try {
            fieldRepository.deleteById(id);
            fieldRepository.flush();
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "This field cannot be deleted because it is being used by job categories or stations."));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body(Map.of("message", "Error deleting field: " + e.getMessage()));
        }
    }

    @PutMapping("/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Field updateField(@PathVariable Long id, @RequestBody Field fieldDetails) {
        return fieldRepository.findById(id).map(field -> {
            field.setName(fieldDetails.getName());
            return fieldRepository.save(field);
        }).orElseThrow(() -> new RuntimeException("Field not found with id " + id));
    }

    @GetMapping("/job-categories")
    public List<JobCategory> getJobCategories(@RequestParam(required = false) Long fieldId) {
        if (fieldId != null) {
            return jobCategoryRepository.findByField_Id(fieldId);
        }
        List<JobCategory> categories = jobCategoryRepository.findAll();
        System.out.println("Fetching Job Categories: found " + categories.size());
        return categories;
    }



    @GetMapping("/districts")
    public List<String> getDistricts() {
        return stationRepository.findDistinctDistricts();
    }

    @GetMapping("/stations")
    public List<Station> getStations(@RequestParam(required = false) String district,
                                     @RequestParam(required = false) Long fieldId,
                                     @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        if ("ALL".equalsIgnoreCase(status)) {
            if (district != null && fieldId != null) {
                return stationRepository.findByDistrictAndField_Id(district, fieldId);
            } else if (district != null) {
                return stationRepository.findByDistrict(district);
            } else if (fieldId != null) {
                return stationRepository.findByField_Id(fieldId);
            }
            return stationRepository.findAll();
        }

        String filterStatus = "PENDING".equalsIgnoreCase(status) ? "PENDING" : "APPROVED";
        if (district != null && fieldId != null) {
            return stationRepository.findByDistrictAndField_IdAndStatus(district, fieldId, filterStatus);
        } else if (district != null) {
            return stationRepository.findByDistrictAndStatus(district, filterStatus);
        } else if (fieldId != null) {
            return stationRepository.findByField_IdAndStatus(fieldId, filterStatus);
        }
        return stationRepository.findByStatus(filterStatus);
    }

    @GetMapping("/stations/pending-count")
    public Map<String, Long> getPendingStationCount() {
        return Map.of("count", stationRepository.countByStatus("PENDING"));
    }

    @PostMapping("/stations/request")
    public org.springframework.http.ResponseEntity<?> requestNewStation(@RequestBody StationRequestDto req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "Station name is required"));
        }
        if (req.getDistrict() == null || req.getDistrict().trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "District is required"));
        }

        Station station = new Station();
        station.setName(req.getName().trim());
        station.setDistrict(req.getDistrict().trim());
        station.setProvince(req.getProvince() != null ? req.getProvince().trim() : "");
        station.setHierarchyLevel(req.getHierarchyLevel() != null ? req.getHierarchyLevel().trim() : "Base Hospital");
        station.setStatus("PENDING");
        station.setRequestedByName(req.getRequestedByName());
        station.setRequestedByPhone(req.getRequestedByPhone());
        station.setRequestedByEmail(req.getRequestedByEmail());
        station.setCreatedAt(java.time.LocalDateTime.now());

        if (req.getFieldId() != null) {
            fieldRepository.findById(req.getFieldId()).ifPresent(station::setField);
        }

        Station savedStation = stationRepository.save(station);

        // Async Notification to all Admin accounts via Email and SMS
        notifyAdminsAboutStationRequest(savedStation);

        return org.springframework.http.ResponseEntity.ok(savedStation);
    }

    private void notifyAdminsAboutStationRequest(Station station) {
        new Thread(() -> {
            try {
                String fieldName = station.getField() != null ? station.getField().getName() : "General";
                List<User> admins = userRepository.findByRole("ADMIN");
                java.util.Set<String> notifiedEmails = new java.util.HashSet<>();
                java.util.Set<String> notifiedPhones = new java.util.HashSet<>();

                for (User admin : admins) {
                    userProfileRepository.findByUserId(admin.getId()).ifPresent(profile -> {
                        // Send Email notification
                        if (profile.getEmail() != null && !profile.getEmail().isBlank()) {
                            String email = profile.getEmail().trim();
                            if (notifiedEmails.add(email.toLowerCase())) {
                                emailService.sendStationRequestNotification(
                                        email,
                                        station.getName(),
                                        station.getDistrict(),
                                        station.getProvince(),
                                        station.getHierarchyLevel(),
                                        fieldName,
                                        station.getRequestedByName(),
                                        station.getRequestedByPhone(),
                                        station.getRequestedByEmail()
                                );
                            }
                        }

                        // Send SMS notification
                        if (profile.getPhoneNumber() != null && !profile.getPhoneNumber().isBlank()) {
                            String phone = profile.getPhoneNumber().trim();
                            if (notifiedPhones.add(phone)) {
                                String smsText = "MutualT Alert: New station approval request for '" + station.getName() +
                                        "' (" + station.getDistrict() + ") by " +
                                        (station.getRequestedByName() != null ? station.getRequestedByName() : "User") +
                                        " (" + (station.getRequestedByPhone() != null ? station.getRequestedByPhone() : "N/A") +
                                        "). Please check Admin Panel.";
                                smsService.sendSms(phone, smsText);
                            }
                        }
                    });
                }

                // Fallback email to kavinda@moonsept.com if not already notified
                if (notifiedEmails.add("kavinda@moonsept.com")) {
                    emailService.sendStationRequestNotification(
                            "kavinda@moonsept.com",
                            station.getName(),
                            station.getDistrict(),
                            station.getProvince(),
                            station.getHierarchyLevel(),
                            fieldName,
                            station.getRequestedByName(),
                            station.getRequestedByPhone(),
                            station.getRequestedByEmail()
                    );
                }
            } catch (Exception e) {
                System.err.println("Error notifying admins about station request: " + e.getMessage());
            }
        }).start();
    }

    @PutMapping("/stations/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> approveStation(@PathVariable Long id) {
        return stationRepository.findById(id).map(station -> {
            station.setStatus("APPROVED");
            Station updated = stationRepository.save(station);
            return org.springframework.http.ResponseEntity.ok(updated);
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @GetMapping("/stations/{id}/affected-users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AffectedUserDto> getAffectedUsers(@PathVariable Long id) {
        List<AffectedUserDto> list = new java.util.ArrayList<>();

        // Find users having currentStation == id
        List<UserProfile> currentProfiles = userProfileRepository.findByCurrentStation_Id(id);
        for (UserProfile p : currentProfiles) {
            list.add(AffectedUserDto.builder()
                    .userId(p.getUser() != null ? p.getUser().getId() : null)
                    .fullName(p.getFullName())
                    .phoneNumber(p.getPhoneNumber())
                    .email(p.getEmail())
                    .nic(p.getNic())
                    .relationType("CURRENT_STATION")
                    .build());
        }

        // Find users having preferredStation == id
        List<TransferPreference> prefs = transferPreferenceRepository.findByPreferredStation_Id(id);
        for (TransferPreference pref : prefs) {
            User u = pref.getUser();
            if (u != null) {
                userProfileRepository.findByUserId(u.getId()).ifPresent(p -> {
                    boolean alreadyIn = list.stream().anyMatch(item -> item.getUserId() != null && item.getUserId().equals(u.getId()));
                    if (!alreadyIn) {
                        list.add(AffectedUserDto.builder()
                                .userId(u.getId())
                                .fullName(p.getFullName())
                                .phoneNumber(p.getPhoneNumber())
                                .email(p.getEmail())
                                .nic(p.getNic())
                                .relationType("PREFERENCE")
                                .build());
                    }
                });
            }
        }
        return list;
    }

    @Transactional
    @PostMapping("/stations/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> rejectAndDeleteStation(
            @PathVariable Long id,
            @RequestBody(required = false) StationRejectionDto rejectionDto) {

        Station station = stationRepository.findById(id).orElse(null);
        if (station == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }

        Long reassignId = rejectionDto != null ? rejectionDto.getReassignStationId() : null;
        Station reassignStation = null;
        if (reassignId != null) {
            reassignStation = stationRepository.findById(reassignId).orElse(null);
        }

        // 1. Update/Clean UserProfiles
        List<UserProfile> currentProfiles = userProfileRepository.findByCurrentStation_Id(id);
        for (UserProfile p : currentProfiles) {
            p.setCurrentStation(reassignStation);
            userProfileRepository.save(p);
        }

        // 2. Update/Clean TransferPreferences
        List<TransferPreference> prefs = transferPreferenceRepository.findByPreferredStation_Id(id);
        for (TransferPreference pref : prefs) {
            if (reassignStation != null) {
                pref.setPreferredStation(reassignStation);
                transferPreferenceRepository.save(pref);
            } else {
                transferPreferenceRepository.delete(pref);
            }
        }

        // 3. Delete Station
        stationRepository.delete(station);
        stationRepository.flush();

        return org.springframework.http.ResponseEntity.ok(Map.of("message", "Station successfully removed."));
    }

    @PostMapping("/job-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public JobCategory createJobCategory(@RequestBody JobCategory category) {
        return jobCategoryRepository.save(category);
    }

    @Transactional
    @DeleteMapping("/job-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> deleteJobCategory(@PathVariable Long id) {
        try {
            jobCategoryRepository.deleteById(id);
            jobCategoryRepository.flush();
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "This category cannot be deleted because it is being used by one or more users."));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body(Map.of("message", "Error deleting category: " + e.getMessage()));
        }
    }

    @PutMapping("/job-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public JobCategory updateJobCategory(@PathVariable Long id, @RequestBody JobCategory categoryDetails) {
        return jobCategoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            if (categoryDetails.getField() != null) {
                category.setField(categoryDetails.getField());
            }
            return jobCategoryRepository.save(category);
        }).orElseThrow(() -> new RuntimeException("Job Category not found with id " + id));
    }



    @PostMapping("/stations")
    @PreAuthorize("hasRole('ADMIN')")
    public Station createStation(@RequestBody Station station) {
        return stationRepository.save(station);
    }

    @Transactional
    @DeleteMapping("/stations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> deleteStation(
            @PathVariable Long id,
            @RequestParam(required = false) Long reassignStationId) {
        StationRejectionDto dto = new StationRejectionDto();
        dto.setReassignStationId(reassignStationId);
        return rejectAndDeleteStation(id, dto);
    }

    @PutMapping("/stations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Station updateStation(@PathVariable Long id, @RequestBody Station stationDetails) {
        return stationRepository.findById(id).map(station -> {
            station.setName(stationDetails.getName());
            station.setDistrict(stationDetails.getDistrict());
            station.setProvince(stationDetails.getProvince());
            station.setHierarchyLevel(stationDetails.getHierarchyLevel());
            if (stationDetails.getField() != null) {
                station.setField(stationDetails.getField());
            }
            return stationRepository.save(station);
        }).orElseThrow(() -> new RuntimeException("Station not found with id " + id));
    }

    @GetMapping("/debug/users")
    public List<Map<String, Object>> debugUsers() {
        return userRepository.findAll().stream().map(u -> {
            boolean hasProfile = userProfileRepository.findByUserId(u.getId()).isPresent();
            String fullName = userProfileRepository.findByUserId(u.getId())
                .map(UserProfile::getFullName).orElse("NONE");
            return Map.of(
                "id", (Object) u.getId(),
                "username", (Object) u.getUsername(),
                "role", (Object) u.getRole(),
                "hasProfile", (Object) hasProfile,
                "fullName", (Object) fullName
            );
        }).collect(Collectors.toList());
    }
}

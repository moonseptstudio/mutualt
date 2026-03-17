package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
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
                                     @RequestParam(required = false) Long fieldId) {
        if (district != null && fieldId != null) {
            return stationRepository.findByDistrictAndField_Id(district, fieldId);
        } else if (district != null) {
            return stationRepository.findByDistrict(district);
        } else if (fieldId != null) {
            return stationRepository.findByField_Id(fieldId);
        }
        List<Station> stations = stationRepository.findAll();
        System.out.println("Fetching Stations: found " + stations.size());
        return stations;
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
    public org.springframework.http.ResponseEntity<?> deleteStation(@PathVariable Long id) {
        try {
            stationRepository.deleteById(id);
            stationRepository.flush();
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("message", "This station cannot be deleted because it is being used by one or more users."));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body(Map.of("message", "Error deleting station: " + e.getMessage()));
        }
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

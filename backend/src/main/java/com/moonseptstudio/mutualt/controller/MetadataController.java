package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class MetadataController {

    @Autowired
    JobCategoryRepository jobCategoryRepository;

    @Autowired
    GradeRepository gradeRepository;

    @Autowired
    StationRepository stationRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/job-categories")
    public List<JobCategory> getJobCategories() {
        List<JobCategory> categories = jobCategoryRepository.findAll();
        System.out.println("Fetching Job Categories: found " + categories.size());
        return categories;
    }

    @GetMapping("/grades")
    public List<Grade> getGrades() {
        List<Grade> grades = gradeRepository.findAll();
        System.out.println("Fetching Grades: found " + grades.size());
        return grades;
    }

    @GetMapping("/stations")
    public List<Station> getStations() {
        List<Station> stations = stationRepository.findAll();
        System.out.println("Fetching Stations: found " + stations.size());
        return stations;
    }

    @PostMapping("/job-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public JobCategory createJobCategory(@RequestBody JobCategory category) {
        return jobCategoryRepository.save(category);
    }

    @DeleteMapping("/job-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteJobCategory(@PathVariable Long id) {
        jobCategoryRepository.deleteById(id);
    }

    @PostMapping("/grades")
    @PreAuthorize("hasRole('ADMIN')")
    public Grade createGrade(@RequestBody Grade grade) {
        return gradeRepository.save(grade);
    }

    @DeleteMapping("/grades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteGrade(@PathVariable Long id) {
        gradeRepository.deleteById(id);
    }

    @PostMapping("/stations")
    @PreAuthorize("hasRole('ADMIN')")
    public Station createStation(@RequestBody Station station) {
        return stationRepository.save(station);
    }

    @DeleteMapping("/stations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStation(@PathVariable Long id) {
        stationRepository.deleteById(id);
    }

    @GetMapping("/debug/users")
    public List<Map<String, Object>> debugUsers() {
        return userRepository.findAll().stream().map(u -> Map.of(
                "username", (Object) u.getUsername(),
                "role", (Object) u.getRole())).collect(Collectors.toList());
    }
}

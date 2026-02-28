package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/job-categories")
    public List<JobCategory> getJobCategories() {
        return jobCategoryRepository.findAll();
    }

    @GetMapping("/grades")
    public List<Grade> getGrades() {
        return gradeRepository.findAll();
    }

    @GetMapping("/stations")
    public List<Station> getStations() {
        return stationRepository.findAll();
    }
}

package com.moonseptstudio.mutualt.controller;

import com.moonseptstudio.mutualt.model.Station;
import com.moonseptstudio.mutualt.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    @Autowired
    StationRepository stationRepository;

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findByStatus("APPROVED");
    }

    @GetMapping("/search")
    public List<Station> searchStations(@RequestParam String query) {
        return stationRepository.findByNameContainingIgnoreCaseAndStatus(query, "APPROVED");
    }

    @GetMapping("/district/{district}")
    public List<Station> getStationsByDistrict(@PathVariable("district") String district) {
        return stationRepository.findByDistrictAndStatus(district, "APPROVED");
    }
}

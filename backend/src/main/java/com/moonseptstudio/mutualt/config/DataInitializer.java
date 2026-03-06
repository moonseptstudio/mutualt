package com.moonseptstudio.mutualt.config;

import com.moonseptstudio.mutualt.model.Station;
import com.moonseptstudio.mutualt.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private StationRepository stationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (stationRepository.count() == 0) {
            Station[] stations = {
                    new Station(null, "National Hospital Sri Lanka", "Colombo", "Western", "National Hospital"),
                    new Station(null, "Colombo South Teaching Hospital", "Colombo", "Western", "Teaching Hospital"),
                    new Station(null, "General Hospital Kandy", "Kandy", "Central", "General Hospital"),
                    new Station(null, "Base Hospital Matara", "Matara", "Southern", "Base Hospital"),
                    new Station(null, "Teaching Hospital Karapitiya", "Galle", "Southern", "Teaching Hospital"),
                    new Station(null, "District General Hospital Gampaha", "Gampaha", "Western", "General Hospital"),
                    new Station(null, "Base Hospital Negombo", "Gampaha", "Western", "Base Hospital"),
                    new Station(null, "Teaching Hospital Jaffna", "Jaffna", "Northern", "Teaching Hospital"),
                    new Station(null, "Base Hospital Vavuniya", "Vavuniya", "Northern", "Base Hospital"),
                    new Station(null, "General Hospital Kurunegala", "Kurunegala", "North Western", "General Hospital")
            };
            stationRepository.saveAll(Arrays.asList(stations));
            System.out.println("Sample station data initialized.");
        }
    }
}

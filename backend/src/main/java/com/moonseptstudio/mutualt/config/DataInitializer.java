package com.moonseptstudio.mutualt.config;

import com.moonseptstudio.mutualt.model.Station;
import com.moonseptstudio.mutualt.model.SubscriptionPackage;
import com.moonseptstudio.mutualt.model.Field;
import com.moonseptstudio.mutualt.repository.PackageRepository;
import com.moonseptstudio.mutualt.repository.StationRepository;
import com.moonseptstudio.mutualt.repository.FieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private FieldRepository fieldRepository;

    @Override
    public void run(String... args) throws Exception {
        if (fieldRepository.count() == 0) {
            fieldRepository.saveAll(Arrays.asList(
                    new Field(null, "Health"),
                    new Field(null, "Education"),
                    new Field(null, "Postal")
            ));
            System.out.println("Sample fields initialized.");
        }
        if (stationRepository.count() == 0) {
            Field health = fieldRepository.findByName("Health").orElseThrow();
            Field education = fieldRepository.findByName("Education").orElseThrow();
            Field postal = fieldRepository.findByName("Postal").orElseThrow();

            Station[] stations = {
                    // Health Stations
                    new Station(null, "National Hospital Sri Lanka", "Colombo", "Western", "National Hospital", health),
                    new Station(null, "Colombo South Teaching Hospital", "Colombo", "Western", "Teaching Hospital", health),
                    new Station(null, "General Hospital Kandy", "Kandy", "Central", "General Hospital", health),
                    new Station(null, "Base Hospital Matara", "Matara", "Southern", "Base Hospital", health),
                    new Station(null, "Teaching Hospital Karapitiya", "Galle", "Southern", "Teaching Hospital", health),
                    new Station(null, "District General Hospital Gampaha", "Gampaha", "Western", "General Hospital", health),
                    new Station(null, "Base Hospital Negombo", "Gampaha", "Western", "Base Hospital", health),
                    new Station(null, "Teaching Hospital Jaffna", "Jaffna", "Northern", "Teaching Hospital", health),
                    new Station(null, "Base Hospital Vavuniya", "Vavuniya", "Northern", "Base Hospital", health),
                    new Station(null, "General Hospital Kurunegala", "Kurunegala", "North Western", "General Hospital", health),

                    // Education Stations (Schools)
                    new Station(null, "Royal College", "Colombo", "Western", "National School", education),
                    new Station(null, "Ananda College", "Colombo", "Western", "National School", education),
                    new Station(null, "Visakha Vidyalaya", "Colombo", "Western", "National School", education),
                    new Station(null, "Dharmaraja College", "Kandy", "Central", "National School", education),
                    new Station(null, "Mahamaya Girls' College", "Kandy", "Central", "National School", education),
                    new Station(null, "Richmond College", "Galle", "Southern", "National School", education),
                    new Station(null, "Mahinda College", "Galle", "Southern", "National School", education),

                    // Postal Stations
                    new Station(null, "General Post Office", "Colombo", "Western", "Head Office", postal),
                    new Station(null, "Central Mail Exchange", "Colombo", "Western", "Processing Center", postal),
                    new Station(null, "Kandy Post Office", "Kandy", "Central", "Main Post Office", postal),
                    new Station(null, "Galle Post Office", "Galle", "Southern", "Main Post Office", postal)
            };
            stationRepository.saveAll(Arrays.asList(stations));
            System.out.println("Sample station data initialized.");
        }

        if (packageRepository.count() == 0) {
            SubscriptionPackage free = new SubscriptionPackage(null, "FREE", 0.0, false, true, "Standard basic features");
            SubscriptionPackage premium = new SubscriptionPackage(null, "PREMIUM", 1500.0, true, false, "All features unlocked");
            packageRepository.saveAll(Arrays.asList(free, premium));
            System.out.println("Subscription packages initialized.");
        }
    }
}

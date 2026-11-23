package com.moonseptstudio.mutualt.util;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedPackages();
        seedFields();
        seedJobCategories();
        seedStations();
        seedAdminUser();
        seedTestUser();
    }

    private void seedFields() {
        if (fieldRepository.count() == 0) {
            fieldRepository.saveAll(Arrays.asList(
                    new Field(null, "Health"),
                    new Field(null, "Education"),
                    new Field(null, "Postal")
            ));
            System.out.println("Seeded Fields.");
        }
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            SubscriptionPackage premium = packageRepository.findByName("PREMIUM").orElseThrow();

            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setSubscriptionPackage(premium);
            userRepository.save(admin);

            UserProfile profile = new UserProfile();
            profile.setUser(admin);
            profile.setFullName("System Administrator");
            profile.setNic("ADMIN001");
            profile.setEmail("admin@mutualt.com");
            List<JobCategory> adminCategories = jobCategoryRepository.findAll();
            if (!adminCategories.isEmpty()) {
                profile.setJobCategory(adminCategories.get(0));
            }
            List<Station> adminStations = stationRepository.findAll();
            if (!adminStations.isEmpty()) {
                profile.setCurrentStation(adminStations.get(0));
            }
            userProfileRepository.save(profile);

            System.out.println("Seeded Admin User: admin / admin123");
        }
    }

    private void seedPackages() {
        if (packageRepository.count() == 0) {
            SubscriptionPackage free = new SubscriptionPackage();
            free.setName("FREE");
            free.setAllows3way(false);
            free.setHasAds(true);

            SubscriptionPackage premium = new SubscriptionPackage();
            premium.setName("PREMIUM");
            premium.setAllows3way(true);
            premium.setHasAds(false);

            packageRepository.saveAll(Arrays.asList(free, premium));
            System.out.println("Seeded Subscription Packages.");
        }
    }

    private void seedJobCategories() {
        if (jobCategoryRepository.count() == 0) {
            Field health = fieldRepository.findByName("Health").orElseThrow();
            jobCategoryRepository.saveAll(Arrays.asList(
                    new JobCategory(null, "Medical Officer", health),
                    new JobCategory(null, "Nursing Officer", health),
                    new JobCategory(null, "Pharmacist", health),
                    new JobCategory(null, "Public Health Inspector", health)));
            System.out.println("Seeded Job Categories.");
        }
    }



    private void seedStations() {
        if (stationRepository.count() == 0) {
            Field health = fieldRepository.findByName("Health").orElseThrow();
            stationRepository.saveAll(Arrays.asList(
                    new Station(null, "National Hospital Sri Lanka", "Colombo", "Western", "National Hospital", health),
                    new Station(null, "Kandy Teaching Hospital", "Kandy", "Central", "Teaching Hospital", health),
                    new Station(null, "Karapitiya Teaching Hospital", "Galle", "Southern", "Teaching Hospital", health),
                    new Station(null, "Matara Teaching Hospital", "Matara", "Southern", "Teaching Hospital", health),
                    new Station(null, "Jaffna Teaching Hospital", "Jaffna", "Northern", "Teaching Hospital", health),
                    new Station(null, "Matale General Hospital", "Matale", "Central", "General Hospital", health),
                    new Station(null, "Panadura Base Hospital", "Kalutara", "Western", "Base Hospital", health)));
            System.out.println("Seeded Stations.");
        }
    }

    private void seedTestUser() {
        if (userRepository.count() == 0) {
            SubscriptionPackage free = packageRepository.findByName("FREE").orElseThrow();

            User user = new User();
            user.setUsername("990011223V");
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setRole("USER");
            user.setSubscriptionPackage(free);
            userRepository.save(user);

            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setFullName("Test User One");
            profile.setNic("990011223V");
            profile.setEmail("test1@example.com");
            List<JobCategory> userCategories = jobCategoryRepository.findAll();
            if (!userCategories.isEmpty()) {
                profile.setJobCategory(userCategories.get(0));
            }
            List<Station> userStations = stationRepository.findAll();
            if (!userStations.isEmpty()) {
                profile.setCurrentStation(userStations.get(0));
            }
            userProfileRepository.save(profile);

            System.out.println("Seeded Test User: 990011223V / password123");
        }
    }
}

package com.moonseptstudio.mutualt.util;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @Autowired
    private GradeRepository gradeRepository;

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
        seedJobCategories();
        seedGrades();
        seedStations();
        seedAdminUser();
        seedTestUser();
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
            profile.setJobCategory(jobCategoryRepository.findAll().get(0));
            profile.setGrade(gradeRepository.findAll().get(0));
            profile.setCurrentStation(stationRepository.findAll().get(0));
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
            jobCategoryRepository.saveAll(Arrays.asList(
                    new JobCategory(null, "Medical Officer"),
                    new JobCategory(null, "Nursing Officer"),
                    new JobCategory(null, "Pharmacist"),
                    new JobCategory(null, "Public Health Inspector")));
            System.out.println("Seeded Job Categories.");
        }
    }

    private void seedGrades() {
        if (gradeRepository.count() == 0) {
            gradeRepository.saveAll(Arrays.asList(
                    new Grade(null, "Grade I"),
                    new Grade(null, "Grade II"),
                    new Grade(null, "Preliminary Grade"),
                    new Grade(null, "Specialist")));
            System.out.println("Seeded Grades.");
        }
    }

    private void seedStations() {
        if (stationRepository.count() == 0) {
            stationRepository.saveAll(Arrays.asList(
                    new Station(null, "National Hospital Sri Lanka", "Colombo", "Western", "National Hospital"),
                    new Station(null, "Teaching Hospital Kandy", "Kandy", "Central", "Teaching Hospital"),
                    new Station(null, "Teaching Hospital Karapitiya", "Galle", "Southern", "Teaching Hospital"),
                    new Station(null, "Teaching Hospital Matara", "Matara", "Southern", "Teaching Hospital"),
                    new Station(null, "Teaching Hospital Jaffna", "Jaffna", "Northern", "Teaching Hospital"),
                    new Station(null, "GH Matale", "Matale", "Central", "General Hospital"),
                    new Station(null, "Base Hospital Panadura", "Kalutara", "Western", "Base Hospital")));
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
            profile.setJobCategory(jobCategoryRepository.findAll().get(0));
            profile.setGrade(gradeRepository.findAll().get(0));
            profile.setCurrentStation(stationRepository.findAll().get(0));
            userProfileRepository.save(profile);

            System.out.println("Seeded Test User: 990011223V / password123");
        }
    }
}

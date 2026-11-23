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

    @Autowired(required = false)
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Sync PostgreSQL sequences with current max IDs
        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('stations', 'id'), COALESCE(MAX(id), 1)) FROM stations");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('fields', 'id'), COALESCE(MAX(id), 1)) FROM fields");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('packages', 'id'), COALESCE(MAX(id), 1)) FROM packages");

                // Standardize station names to '[Location] [Type]' format (e.g. 'Nochchiyagama Divisional Hospital')
                // 1. Fix already shifted '(Type A) – Puttalam Base Hospital' -> 'Puttalam Base Hospital (Type A)'
                jdbcTemplate.execute("UPDATE stations SET name = trim(regexp_replace(name, '^\\\\((Type\\\\s+[A-Za-z0-9]+)\\\\)\\\\s*[-–—]?\\\\s*(.+)$', '\\\\2 (\\\\1)')) WHERE name ~ '^\\\\((Type\\\\s+[A-Za-z0-9]+)\\\\)'");

                // 2. Fix untouched 'Base Hospital (Type A) - Puttalam' -> 'Puttalam Base Hospital (Type A)'
                jdbcTemplate.execute("UPDATE stations SET name = trim(regexp_replace(name, '^(Provincial General Hospital|District General Hospital|District Base Hospital|District/Divisional Hospital|Teaching Hospital|Divisional Hospital|General Hospital|Base Hospital|District Hospital)\\\\s*\\\\(?(Type\\\\s+[A-Za-z0-9]+)\\\\)?\\\\s*[-–—]?\\\\s*(.+)$', '\\\\3 \\\\1 (\\\\2)')) WHERE name ~ '^(Provincial General Hospital|District General Hospital|District Base Hospital|District/Divisional Hospital|Teaching Hospital|Divisional Hospital|General Hospital|Base Hospital|District Hospital)\\\\s*\\\\(?(Type\\\\s+[A-Za-z0-9]+)\\\\)?'");

                // 3. Fix regular 'District Base Hospital - Nikaweratiya' -> 'Nikaweratiya District Base Hospital'
                jdbcTemplate.execute("UPDATE stations SET name = trim(regexp_replace(name, '^(Provincial General Hospital|District General Hospital|District Base Hospital|District/Divisional Hospital|Teaching Hospital|Divisional Hospital|General Hospital|Base Hospital|District Hospital)(\\\\s*[-–—]\\\\s*|\\\\s+)(.+)$', '\\\\3 \\\\1')) WHERE name ~ '^(Provincial General Hospital|District General Hospital|District Base Hospital|District/Divisional Hospital|Teaching Hospital|Divisional Hospital|General Hospital|Base Hospital|District Hospital)(\\\\s*[-–—]\\\\s*|\\\\s+)'");

                // 4. Abbreviations
                jdbcTemplate.execute("UPDATE stations SET name = 'Matale General Hospital' WHERE name = 'GH Matale'");

                // 5. Special institutional names & redundant classification cleanup
                jdbcTemplate.execute("UPDATE stations SET name = 'Castle Street Hospital for Women (Teaching)' WHERE name LIKE 'Castle Street Hospital for Women%'");
                jdbcTemplate.execute("UPDATE stations SET name = 'Lady Ridgeway Hospital for Children (Teaching)' WHERE name LIKE 'Lady Ridgeway Hospital for Children%'");
                jdbcTemplate.execute("UPDATE stations SET name = 'De Soysa Hospital for Women (Teaching)' WHERE name LIKE 'De Soysa Hospital for Women%'");
                jdbcTemplate.execute("UPDATE stations SET name = 'Baddegama District Hospital (Grade A)' WHERE name LIKE 'Baddegama%Grade A%'");
                jdbcTemplate.execute("UPDATE stations SET name = 'Balapitiya Base Hospital (Grade A)' WHERE name LIKE 'Balapitiya%Grade A%'");
                jdbcTemplate.execute("UPDATE stations SET name = 'Polonnaruwa District General Hospital' WHERE name LIKE 'Polonnaruwa%General%District General Hospital'");
                jdbcTemplate.execute("UPDATE stations SET name = 'Balangoda District Base Hospital' WHERE name LIKE 'Balangoda%District Base%Base Hospital'");

                // 6. Remove incorrect Rambukkana District Hospital under Ratnapura (it belongs to Kegalle)
                jdbcTemplate.execute("DELETE FROM stations WHERE name = 'Rambukkana District Hospital' AND district = 'Ratnapura'");

                // 7. Fix existing active trial users whose trial was prematurely truncated by the old createdAt-based logic
                jdbcTemplate.execute("UPDATE users SET trial_end_date = NOW() + INTERVAL '14 days', subscription_end_date = GREATEST(COALESCE(subscription_end_date, NOW()), NOW() + INTERVAL '14 days') WHERE trial_used = true AND trial_end_date > NOW() AND trial_end_date < NOW() + INTERVAL '13 days'");
            } catch (Exception e) {
                System.err.println("Notice: Could not sync database sequences or standardize station names: " + e.getMessage());
            }
        }
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
                    new Station(null, "Kandy General Hospital", "Kandy", "Central", "General Hospital", health),
                    new Station(null, "Matara Base Hospital", "Matara", "Southern", "Base Hospital", health),
                    new Station(null, "Karapitiya Teaching Hospital", "Galle", "Southern", "Teaching Hospital", health),
                    new Station(null, "Gampaha District General Hospital", "Gampaha", "Western", "General Hospital", health),
                    new Station(null, "Negombo Base Hospital", "Gampaha", "Western", "Base Hospital", health),
                    new Station(null, "Jaffna Teaching Hospital", "Jaffna", "Northern", "Teaching Hospital", health),
                    new Station(null, "Vavuniya Base Hospital", "Vavuniya", "Northern", "Base Hospital", health),
                    new Station(null, "Kurunegala General Hospital", "Kurunegala", "North Western", "General Hospital", health),

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

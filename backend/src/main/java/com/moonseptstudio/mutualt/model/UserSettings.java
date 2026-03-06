package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private Boolean instantMatchAlerts = true;
    private Boolean cycleDetectionAlerts = true;
    private Boolean systemUpdatesAlerts = false;
    private Boolean publicProfile = true;
    private Boolean regionalDiscovery = true;
    private Boolean darkMode = false;
}

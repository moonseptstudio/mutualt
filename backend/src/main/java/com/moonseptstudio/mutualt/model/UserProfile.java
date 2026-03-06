package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String nic;

    private String email;

    @ManyToOne
    @JoinColumn(name = "job_category_id")
    private JobCategory jobCategory;

    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;

    @ManyToOne
    @JoinColumn(name = "current_station_id")
    private Station currentStation;

    private String phoneNumber;

    @Column(columnDefinition = "int default 1")
    private Integer verificationLevel = 1;

    private String serviceLetterStatus = "PENDING"; // PENDING, REVIEWING, COMPLETED
    private String biometricsStatus = "PENDING"; // PENDING, COMPLETED
    private String profileImageUrl;
    private String serviceLetterUrl;
}

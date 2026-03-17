package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_users")
@Data
@NoArgsConstructor
public class PendingUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String nic;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private Long jobCategoryId;

    @Column(nullable = false)
    private Long currentStationId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

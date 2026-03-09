package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    private String matchType = "DIRECT"; // DIRECT, TRIPLE

    private String cycleUserIds; // Comma separated IDs for triple matches

    private LocalDateTime createdAt = LocalDateTime.now();

    // Optional: reference to which station/match this is about
    // For now, keeping it simple as a request between users
}

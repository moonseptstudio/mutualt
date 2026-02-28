package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transfer_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "preferred_station_id")
    private Station preferredStation;

    private Integer priority; // 1 = Highest
}

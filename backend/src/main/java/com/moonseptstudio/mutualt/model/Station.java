package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String province;

    private String hierarchyLevel; // e.g., 'National Hospital', 'Base Hospital'

    @ManyToOne
    @JoinColumn(name = "field_id")
    private Field field;

    @Column(nullable = false, columnDefinition = "varchar(50) default 'APPROVED'")
    private String status = "APPROVED"; // "APPROVED", "PENDING", "REJECTED"

    private String requestedByName;
    private String requestedByEmail;
    private String requestedByPhone;

    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public Station(Long id, String name, String district, String province, String hierarchyLevel, Field field) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.province = province;
        this.hierarchyLevel = hierarchyLevel;
        this.field = field;
        this.status = "APPROVED";
        this.createdAt = java.time.LocalDateTime.now();
    }
}

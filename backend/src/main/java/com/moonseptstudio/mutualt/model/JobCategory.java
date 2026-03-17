package com.moonseptstudio.mutualt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "field_id")
    private Field field;
}

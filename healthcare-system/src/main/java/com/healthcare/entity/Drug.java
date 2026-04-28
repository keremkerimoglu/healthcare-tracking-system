package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "drugs")
@Data
public class Drug {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
}
package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reporterId; // ID of the user submitting the report

    private Long reportedJobId; // Nullable, if reporting a specific job
    private Long reportedUserId; // Nullable, if reporting a specific user directly

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, REVIEWED, ACTION_TAKEN, DISMISSED

    @CreationTimestamp
    private LocalDateTime createdAt;
}

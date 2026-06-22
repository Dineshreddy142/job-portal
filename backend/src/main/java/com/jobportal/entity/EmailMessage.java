package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We can associate the email with a specific user if needed
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "sender", nullable = false)
    private String sender;

    @Column(name = "subject")
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "is_job_related")
    private boolean isJobRelated;

    @Column(name = "is_read")
    private boolean isRead;
}

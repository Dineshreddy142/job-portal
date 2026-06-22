package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Column(name = "position")
    private String position;

    @Column(name = "resume_path")
    private String resumePath;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "company_id_card")
    private String companyIdCard;

    @Column(name = "company_id_card_image", columnDefinition = "LONGBLOB")
    private byte[] companyIdCardImage;

    @Builder.Default

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    public boolean isVerified() {
        return isVerified != null && isVerified;
    }

    public void setVerified(boolean verified) {
        this.isVerified = verified;
    }


    @Builder.Default
    @Column(name = "notify_by_email")
    private Boolean notifyByEmail = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean status = true; // true = active, false = deactivated

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;
    
    @Column(name = "google_refresh_token", length = 512)
    private String googleRefreshToken;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<SavedJob> savedJobs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (notifyByEmail == null) {
            notifyByEmail = true;
        }
        createdAt = LocalDateTime.now();
    }

    public boolean isNotifyByEmail() {
        return Boolean.TRUE.equals(notifyByEmail);
    }
}

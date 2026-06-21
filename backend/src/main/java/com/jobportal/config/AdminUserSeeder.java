package com.jobportal.config;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final jakarta.persistence.EntityManager entityManager;

    @Value("${app.admin.email:admin@jobportal.com}")
    private String adminEmail;

    @Value("${app.admin.password:changeme}")
    private String adminPassword;

    @Value("${app.security-admin.email:security@jobportal.com}")
    private String securityAdminEmail;

    @Value("${app.security-admin.password:changeme}")
    private String securityAdminPassword;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) throws Exception {
        log.info("AdminUserSeeder is running...");
        try {
            // Fix schema length for role column if needed
            entityManager.createNativeQuery("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)").executeUpdate();
            log.info("Database schema verified/updated (role column length).");

            // Create Admin if not exists (do NOT reset password on every boot)
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .name("System Administrator")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .status(true)
                        .isVerified(true)
                        .build();
                userRepository.save(Objects.requireNonNull(admin));
                log.info("Default Admin user created: {}", adminEmail);
            } else {
                log.info("Admin user already exists, skipping creation.");
            }

            // Create Security Admin if not exists (do NOT reset password on every boot)
            if (userRepository.findByEmail(securityAdminEmail).isEmpty()) {
                User securityUser = User.builder()
                        .name("Security Administrator")
                        .email(securityAdminEmail)
                        .password(passwordEncoder.encode(securityAdminPassword))
                        .role(Role.SECURITY_ADMIN)
                        .status(true)
                        .isVerified(true)
                        .build();
                userRepository.save(Objects.requireNonNull(securityUser));
                log.info("Default Security Admin user created: {}", securityAdminEmail);
            } else {
                log.info("Security Admin user already exists, skipping creation.");
            }
        } catch (Exception e) {
            log.error("ERROR in AdminUserSeeder: {}", e.getMessage(), e);
        }
    }
}

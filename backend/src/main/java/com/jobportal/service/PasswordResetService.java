package com.jobportal.service;

import com.jobportal.entity.PasswordResetToken;
import com.jobportal.entity.User;
import com.jobportal.repository.PasswordResetTokenRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.reset.base-url:http://localhost:3000}")
    private String resetBaseUrl;

    public void sendResetLink(String email) {
        log.info("Password reset requested for email: {}", email);
        if (email == null) {
            log.warn("Reset link request with null email");
            return;
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.warn("User not found for email: {}", email);
            throw new RuntimeException("No account found with that email address.");
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken t = new PasswordResetToken();
        t.setToken(token);
        t.setUser(user);
        t.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(t);

        String link = resetBaseUrl + "/reset-password?token=" + token;

        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("name", user.getName());
        variables.put("resetLink", link);

        // Send email and also log the reset link for easier debugging in local/dev environments
        emailService.sendHtmlEmail(email, "Reset your JobPortal password", "password-reset", variables);
        
        log.info("\n===============================================================================\n" +
                 "PASSWORD RESET LINK GENERATED FOR: {}\n" +
                 "CLICK HERE TO RESET: {}\n" +
                 "===============================================================================\n", 
                 email, link);
    }

    public boolean validateToken(String token) {
        if (token == null) return false;
        PasswordResetToken t = tokenRepository.findByToken(token);
        return t != null && t.getExpiryDate() != null && t.getExpiryDate().isAfter(LocalDateTime.now());
    }

    public void updatePassword(String token, String newPassword) {
        PasswordResetToken t = tokenRepository.findByToken(token);
        if (t == null) throw new RuntimeException("Invalid or expired reset link.");
        if (t.getExpiryDate() == null || t.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(t);
            throw new RuntimeException("Invalid or expired reset link.");
        }

        User user = t.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(t);
    }
}

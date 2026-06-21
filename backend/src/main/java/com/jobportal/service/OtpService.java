package com.jobportal.service;

import com.jobportal.entity.Otp;
import com.jobportal.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    @Transactional
    public void sendOtp(String email) {
        // Delete any existing OTP for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new SecureRandom().nextInt(1000000));
        
        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5)) // 5 minutes expiry
                .build();
        
        otpRepository.save(Objects.requireNonNull(otp));

        // Send Email
        Map<String, Object> variables = new HashMap<>();
        variables.put("otpCode", otpCode);
        variables.put("expiryMinutes", 5);
        
        emailService.sendHtmlEmail(email, "Your Registration OTP", "otp-verification", variables);
    }

    public boolean verifyOtp(String email, String otpCode) {
        return otpRepository.findByEmailAndOtpCode(email, otpCode)
                .map(otp -> otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Transactional
    public void deleteOtp(String email) {
        otpRepository.deleteByEmail(email);
    }
}

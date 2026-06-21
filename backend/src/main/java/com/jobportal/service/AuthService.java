package com.jobportal.service;

import com.jobportal.dto.AuthResponse;
import com.jobportal.dto.ForgotPasswordRequest;
import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.ResetPasswordRequest;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Objects;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

        private static final Map<String, ResetTokenData> RESET_TOKENS = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final OtpService otpService;

    @org.springframework.beans.factory.annotation.Value("${app.reset.base-url:http://localhost:3000}")
    private String resetBaseUrl;

        private String normalizeEmail(String email) {
                return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        }

                private static final class ResetTokenData {
                        private final String email;
                        private final LocalDateTime expiresAt;

                        private ResetTokenData(String email, LocalDateTime expiresAt) {
                                this.email = email;
                                this.expiresAt = expiresAt;
                        }
                }

        public void requestPasswordReset(ForgotPasswordRequest request) {
                String email = normalizeEmail(request.getEmail());
                User user = userRepository.findByEmail(email)
                                        .orElse(null);

                        if (user == null) {
                                return;
                        }

                String token = UUID.randomUUID().toString();
                        RESET_TOKENS.put(token, new ResetTokenData(email, LocalDateTime.now().plusMinutes(30)));

                String resetLink = resetBaseUrl + "/reset-password?token=" + token;
                
                Map<String, Object> variables = new java.util.HashMap<>();
                variables.put("name", user.getName());
                variables.put("resetLink", resetLink);

                emailService.sendHtmlEmail(user.getEmail(), "Reset your JobPortal password", "password-reset", variables);
        }

        public void resetPassword(ResetPasswordRequest request) {
                ResetTokenData tokenData = RESET_TOKENS.get(request.getToken());

                if (tokenData == null || tokenData.expiresAt.isBefore(LocalDateTime.now())) {
                        RESET_TOKENS.remove(request.getToken());
                        throw new RuntimeException("Invalid or expired reset link.");
                }

                User user = userRepository.findByEmail(tokenData.email)
                                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
                RESET_TOKENS.remove(request.getToken());
        }

    public AuthResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.getEmail());

		// Prevent privilege escalation: only JOB_SEEKER and RECRUITER roles allowed via registration
		String requestedRole = request.getRole();
		if (requestedRole == null || (!"JOB_SEEKER".equals(requestedRole) && !"RECRUITER".equals(requestedRole))) {
			throw new RuntimeException("Invalid role. Only JOB_SEEKER and RECRUITER are allowed.");
		}

		if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already in use");
        }

        // Verify OTP
        if (request.getOtp() == null || !otpService.verifyOtp(email, request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP. Please try again.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .status(true)
                .isVerified(Role.valueOf(request.getRole()) == Role.JOB_SEEKER)
                .build();

        userRepository.save(Objects.requireNonNull(user));
        otpService.deleteOtp(email);

        // Send Welcome Email
        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("name", user.getName());
        emailService.sendHtmlEmail(user.getEmail(), "Welcome to JobPortal", "welcome", variables);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails, user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .position(user.getPosition())
                .profilePicture(user.getProfilePicture())
                .isVerified(user.isVerified())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isStatus()) {
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails, user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .position(user.getPosition())
                .profilePicture(user.getProfilePicture())
                .isVerified(user.isVerified())
                .build();
    }
}

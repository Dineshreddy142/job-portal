package com.jobportal.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.jobportal.dto.AuthResponse;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    // --- Pending new-user registrations ---
    // When a new Google user is detected, we store their verified info here temporarily
    // (auth code is single-use, so we can't reuse it; instead we store what we got from it)
    private static final Map<String, PendingGoogleUser> PENDING_REGISTRATIONS = new ConcurrentHashMap<>();

    private static class PendingGoogleUser {
        final String email;
        final String name;
        final String refreshToken;
        final LocalDateTime expiresAt;

        PendingGoogleUser(String email, String name, String refreshToken) {
            this.email = email;
            this.name = name;
            this.refreshToken = refreshToken;
            this.expiresAt = LocalDateTime.now().plusMinutes(10);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /**
     * Exchange Google authorization code for tokens.
     * - If user exists → log in and return JWT.
     * - If new user → store their verified info and return a pendingToken so the frontend
     *   can call completeGoogleRegistration(pendingToken, role) after role selection.
     *
     * @return map with either "jwt" key (success) or "pendingToken","email","name" (new user)
     */
    public Map<String, Object> authenticateWithGoogle(String authCode) {
        try {
            // Exchange authorization code for tokens (code is consumed here, single use)
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    googleClientId,
                    googleClientSecret,
                    authCode,
                    "postmessage" // Required for initCodeClient JS flow
            ).execute();

            String refreshToken = tokenResponse.getRefreshToken();

            // Extract ID token to get user info
            GoogleIdToken googleIdToken = tokenResponse.parseIdToken();
            if (googleIdToken == null) {
                throw new RuntimeException("Failed to parse Google ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail().trim().toLowerCase();
            String name = (String) payload.get("name");
            if (name == null || name.isBlank()) {
                name = email.split("@")[0];
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // New user — store verified info, return a pendingToken for role selection
                String pendingToken = UUID.randomUUID().toString();
                PENDING_REGISTRATIONS.put(pendingToken, new PendingGoogleUser(email, name, refreshToken));
                return Map.of(
                        "status", "NEW_USER_ROLE_REQUIRED",
                        "pendingToken", pendingToken,
                        "email", email,
                        "name", name
                );
            }

            if (!user.isStatus()) {
                throw new RuntimeException("Account is deactivated. Please contact administrator.");
            }

            // Save refresh token if we got a fresh one
            if (refreshToken != null) {
                user.setGoogleRefreshToken(refreshToken);
                userRepository.save(user);
            }

            return Map.of("status", "SUCCESS", "authResponse", buildAuthResponse(user));

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    /**
     * Complete registration for a new Google user after they've selected their role.
     * Uses the pendingToken returned from authenticateWithGoogle() — NOT the auth code.
     */
    public AuthResponse completeGoogleRegistration(String pendingToken, String role) {
        PendingGoogleUser pending = PENDING_REGISTRATIONS.remove(pendingToken);

        if (pending == null || pending.isExpired()) {
            throw new RuntimeException("Session expired. Please sign in with Google again.");
        }

        // Validate role
        Role userRole;
        try {
            userRole = Role.valueOf(role.toUpperCase());
            if (userRole != Role.JOB_SEEKER && userRole != Role.RECRUITER) {
                throw new RuntimeException("Invalid role. Only JOB_SEEKER and RECRUITER are allowed.");
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role provided.");
        }

        // Double-check user doesn't already exist (race condition guard)
        if (userRepository.existsByEmail(pending.email)) {
            User existingUser = userRepository.findByEmail(pending.email).get();
            if (!existingUser.isStatus()) {
                throw new RuntimeException("Account is deactivated. Please contact administrator.");
            }
            return buildAuthResponse(existingUser);
        }

        // Create the new user
        User newUser = User.builder()
                .name(pending.name)
                .email(pending.email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(userRole)
                .status(true)
                .isVerified(userRole == Role.JOB_SEEKER)
                .googleRefreshToken(pending.refreshToken)
                .build();

        User savedUser = userRepository.save(newUser);
        return buildAuthResponse(savedUser);
    }

    private AuthResponse buildAuthResponse(User user) {
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

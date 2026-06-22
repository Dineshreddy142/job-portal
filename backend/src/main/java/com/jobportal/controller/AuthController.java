package com.jobportal.controller;

import com.jobportal.dto.AuthResponse;
import java.util.Map;
import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.service.AuthService;
import com.jobportal.service.GoogleOAuthService;
import com.jobportal.service.PasswordResetService;
import com.jobportal.dto.ForgotPasswordRequest;
import com.jobportal.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final com.jobportal.service.OtpService otpService;
    private final GoogleOAuthService googleOAuthService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String authCode = body.get("code");

        if (authCode == null || authCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google authorization code is required"));
        }

        try {
            Map<String, Object> result = googleOAuthService.authenticateWithGoogle(authCode);
            String status = (String) result.get("status");

            if ("NEW_USER_ROLE_REQUIRED".equals(status)) {
                // Return pendingToken + email + name so frontend can show role selection
                return ResponseEntity.status(202).body(Map.of(
                        "status", "NEW_USER_ROLE_REQUIRED",
                        "pendingToken", result.get("pendingToken"),
                        "email", result.get("email"),
                        "name", result.get("name")
                ));
            }

            return ResponseEntity.ok(result.get("authResponse"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/google/complete")
    public ResponseEntity<?> googleComplete(@RequestBody Map<String, String> body) {
        String pendingToken = body.get("pendingToken");
        String role = body.get("role");

        if (pendingToken == null || pendingToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Pending token is required"));
        }
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }

        try {
            AuthResponse response = googleOAuthService.completeGoogleRegistration(pendingToken, role);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestBody Map<String, String> request) {
        otpService.sendOtp(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetLink(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Boolean>> validateToken(@RequestParam String token) {
        boolean ok = passwordResetService.validateToken(token);
        Map<String, Boolean> resp = new java.util.HashMap<>();
        resp.put("valid", ok);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.updatePassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}

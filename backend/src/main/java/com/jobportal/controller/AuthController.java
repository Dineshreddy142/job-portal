package com.jobportal.controller;

import com.jobportal.dto.AuthResponse;
import java.util.Map;
import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.service.AuthService;
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

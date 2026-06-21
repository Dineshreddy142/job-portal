package com.jobportal.controller;

import com.jobportal.dto.UserDto;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityController {

    private final SecurityService securityService;

    @GetMapping("/unverified-recruiters")
    @PreAuthorize("hasAnyRole('SECURITY_ADMIN', 'ADMIN')")
    public ResponseEntity<List<UserDto>> getUnverifiedRecruiters() {
        return ResponseEntity.ok(
            securityService.getUnverifiedRecruiters().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/verified-recruiters")
    @PreAuthorize("hasAnyRole('SECURITY_ADMIN', 'ADMIN')")
    public ResponseEntity<List<UserDto>> getVerifiedRecruiters() {
        return ResponseEntity.ok(
            securityService.getVerifiedRecruiters().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList())
        );
    }

    @PostMapping("/verify/{recruiterId}")
    @PreAuthorize("hasAnyRole('SECURITY_ADMIN', 'ADMIN')")
    public ResponseEntity<String> verifyRecruiter(@PathVariable Long recruiterId, @RequestParam boolean verify) {
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        securityService.verifyRecruiter(recruiterId, verify);
        return ResponseEntity.ok(verify ? "Recruiter verified successfully" : "Recruiter verification removed");
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .position(user.getPosition())
                .profilePicture(user.getProfilePicture())
                .companyIdCard(user.getCompanyIdCard())
                .isVerified(user.isVerified())
                .status(user.isStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

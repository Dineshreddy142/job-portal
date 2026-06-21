package com.jobportal.controller;

import com.jobportal.dto.ApplicationDto;
import com.jobportal.dto.AiMatcherDto;
import com.jobportal.security.SecurityUtils;
import com.jobportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApplicationDto> applyForJob(
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile resume,
            Authentication authentication) {
        // Extract applicantId from JWT instead of request to prevent impersonation
        Long applicantId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(applicationService.applyForJob(jobId, applicantId, resume));
    }

    @GetMapping("/applicant/{applicantId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByApplicant(@PathVariable Long applicantId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, applicantId);
        return ResponseEntity.ok(applicationService.getApplicationsByApplicant(applicantId));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByJob(
            @PathVariable Long jobId,
            Authentication authentication) {
        // Extract recruiterId from JWT
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId, recruiterId));
    }

    @GetMapping("/recruiter/{recruiterId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByRecruiter(@PathVariable Long recruiterId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, recruiterId);
        return ResponseEntity.ok(applicationService.getApplicationsByRecruiter(recruiterId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApplicationDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        // Extract recruiterId from JWT
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status, recruiterId));
    }

    @PutMapping("/{id}/notes")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApplicationDto> updateNotes(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        // Extract recruiterId from JWT
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(applicationService.updateApplicationNotes(id, body.get("notes"), recruiterId));
    }

    @GetMapping("/ai-matcher/{recruiterId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<AiMatcherDto>> getMatchedCandidates(@PathVariable Long recruiterId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, recruiterId);
        return ResponseEntity.ok(applicationService.getMatchedCandidates(recruiterId));
    }
}

package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.security.SecurityUtils;
import com.jobportal.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;
    private final SecurityUtils securityUtils;

    @PostMapping("/{userId}/{jobId}")
    public ResponseEntity<?> saveJob(@PathVariable Long userId, @PathVariable Long jobId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, userId);
        savedJobService.saveJob(userId, jobId);
        return ResponseEntity.ok(java.util.Map.of("message", "Job saved successfully"));
    }

    @DeleteMapping("/{userId}/{jobId}")
    public ResponseEntity<?> unsaveJob(@PathVariable Long userId, @PathVariable Long jobId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, userId);
        savedJobService.unsaveJob(userId, jobId);
        return ResponseEntity.ok(java.util.Map.of("message", "Job unsaved successfully"));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<JobDto>> getSavedJobs(@PathVariable Long userId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, userId);
        return ResponseEntity.ok(savedJobService.getSavedJobs(userId));
    }

    @GetMapping("/{userId}/{jobId}/status")
    public ResponseEntity<Boolean> isJobSaved(@PathVariable Long userId, @PathVariable Long jobId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, userId);
        return ResponseEntity.ok(savedJobService.isJobSaved(userId, jobId));
    }
}

package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.dto.RecruiterStatsDto;
import com.jobportal.security.SecurityUtils;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<JobDto>> getAllJobs(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobs(search));
        }
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody JobDto jobDto, Authentication authentication) {
        // Extract recruiterId from JWT instead of trusting the request body
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(jobService.createJob(jobDto, recruiterId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobDto> updateJob(@PathVariable Long id, @Valid @RequestBody JobDto jobDto, Authentication authentication) {
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(jobService.updateJob(id, jobDto, recruiterId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id, Authentication authentication) {
        Long recruiterId = securityUtils.getAuthenticatedUserId(authentication);
        jobService.deleteJob(id, recruiterId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recruiter/{recruiterId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobDto>> getJobsByRecruiter(@PathVariable Long recruiterId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, recruiterId);
        return ResponseEntity.ok(jobService.getJobsByRecruiter(recruiterId));
    }

    @GetMapping("/recruiter/{recruiterId}/stats")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<RecruiterStatsDto> getRecruiterStats(@PathVariable Long recruiterId, Authentication authentication) {
        securityUtils.verifyOwnership(authentication, recruiterId);
        return ResponseEntity.ok(jobService.getRecruiterStats(recruiterId));
    }
}

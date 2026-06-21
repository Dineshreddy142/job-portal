package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.entity.Job;
import com.jobportal.entity.Notification;
import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void saveJob(Long userId, Long jobId) {
        Objects.requireNonNull(userId, "User ID must not be null");
        Objects.requireNonNull(jobId, "Job ID must not be null");
        log.info("Saving job ID: {} for user ID: {}", jobId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!savedJobRepository.existsByUserAndJob(user, job)) {
            SavedJob savedJob = SavedJob.builder()
                    .user(user)
                    .job(job)
                    .build();
            Objects.requireNonNull(savedJobRepository.save(Objects.requireNonNull(savedJob)));
            
            // Create Notification
            Notification notification = Notification.builder()
                    .user(user)
                    .message("You saved the job: " + job.getTitle())
                    .isRead(false)
                    .build();
            Objects.requireNonNull(notificationRepository.save(Objects.requireNonNull(notification)));
            log.info("Job ID: {} successfully saved for user ID: {}", jobId, userId);
        } else {
            log.warn("Job ID: {} already saved for user ID: {}", jobId, userId);
        }
    }

    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        Objects.requireNonNull(userId, "User ID must not be null");
        Objects.requireNonNull(jobId, "Job ID must not be null");
        log.info("Unsaving job ID: {} for user ID: {}", jobId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        savedJobRepository.deleteByUserAndJob(user, job);
        
        // Create Notification
        Notification notification = Notification.builder()
                .user(user)
                .message("You removed the job: " + job.getTitle() + " from your saved list.")
                .isRead(false)
                .build();
        Objects.requireNonNull(notificationRepository.save(Objects.requireNonNull(notification)));
        log.info("Job ID: {} successfully unsaved for user ID: {}", jobId, userId);
    }

    @Transactional(readOnly = true)
    public List<JobDto> getSavedJobs(Long userId) {
        Objects.requireNonNull(userId, "User ID must not be null");
        log.info("Fetching saved jobs for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return savedJobRepository.findByUser(user)
                .stream()
                .map(sj -> mapToDto(sj.getJob()))
                .collect(Collectors.toList());
    }

    private JobDto mapToDto(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setSalary(job.getSalary());
        dto.setLocation(job.getLocation());
        dto.setSkills(job.getSkills());
        if (job.getRecruiter() != null) {
            dto.setRecruiterId(job.getRecruiter().getId());
            dto.setRecruiterName(job.getRecruiter().getName());
        }
        if (job.getStatus() != null) dto.setStatus(job.getStatus().name());
        if (job.getJobType() != null) dto.setJobType(job.getJobType().name());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setDeadline(job.getDeadline());
        return dto;
    }

    @Transactional(readOnly = true)
    public boolean isJobSaved(Long userId, Long jobId) {
        Objects.requireNonNull(userId, "User ID must not be null");
        Objects.requireNonNull(jobId, "Job ID must not be null");
        User user = userRepository.findById(userId).orElse(null);
        Job job = jobRepository.findById(jobId).orElse(null);
        if (user == null || job == null) return false;
        return savedJobRepository.existsByUserAndJob(user, job);
    }
}

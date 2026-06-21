package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.dto.RecruiterStatsDto;
import com.jobportal.entity.Application;
import com.jobportal.entity.Role;
import com.jobportal.entity.Notification;
import com.jobportal.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    @Value("${app.reset.base-url:http://localhost:3000}")
    private String baseUrl;

    public JobDto createJob(JobDto jobDto, Long recruiterId) {
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!recruiter.isVerified()) {
            throw new RuntimeException("Account not verified. Please wait for admin approval to post jobs.");
        }

        Job job = Job.builder()
                .title(jobDto.getTitle())
                .description(jobDto.getDescription())
                .salary(jobDto.getSalary())
                .location(jobDto.getLocation())
                .skills(jobDto.getSkills())
                .recruiter(recruiter)
                .status(Job.JobStatus.ACTIVE)
                .jobType(jobDto.getJobType() != null ? Job.JobType.valueOf(jobDto.getJobType()) : Job.JobType.FULL_TIME)
                .deadline(jobDto.getDeadline())
                .build();

        Job savedJob = Objects.requireNonNull(jobRepository.save(Objects.requireNonNull(job)));
        
        // Notify all job seekers
        notifyJobSeekers(savedJob);

        return mapToDto(savedJob);
    }

    private void notifyJobSeekers(Job job) {
        List<User> seekers = userRepository.findByRole(Role.JOB_SEEKER);
        String subject = "New Job Opportunity: " + job.getTitle() + " at " + job.getRecruiter().getName();
        
        int sentCount = 0;
        for (User seeker : seekers) {
            if (Boolean.TRUE.equals(seeker.getNotifyByEmail())) {
                java.util.Map<String, Object> variables = new java.util.HashMap<>();
                variables.put("name", seeker.getName());
                variables.put("jobTitle", job.getTitle());
                variables.put("companyName", job.getRecruiter().getName());
                variables.put("location", job.getLocation());
                variables.put("jobLink", baseUrl + "/jobs");

                emailService.sendHtmlEmail(seeker.getEmail(), subject, "new-job-alert", variables);
                
                // Also send in-app notification
                Notification notification = Notification.builder()
                        .user(seeker)
                        .message("New Job Alert: " + job.getTitle() + " at " + job.getRecruiter().getName())
                        .isRead(false)
                        .build();
                Objects.requireNonNull(notificationRepository.save(Objects.requireNonNull(notification)));
                
                sentCount++;
            }
        }
        System.out.println("Job Alert: Sent notifications to " + sentCount + " job seekers for job: " + job.getTitle());
    }

    public List<JobDto> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<JobDto> searchJobs(String keyword) {
        return jobRepository.findByLocationContainingIgnoreCaseOrTitleContainingIgnoreCase(keyword, keyword)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public JobDto getJobById(Long id) {
        Objects.requireNonNull(id, "Job ID must not be null");
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToDto(job);
    }

    public List<JobDto> getJobsByRecruiter(Long recruiterId) {
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        return jobRepository.findByRecruiterId(recruiterId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public JobDto updateJob(Long id, JobDto jobDto, Long recruiterId) {
        Objects.requireNonNull(id, "Job ID must not be null");
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to update this job");
        }

        job.setTitle(jobDto.getTitle());
        job.setDescription(jobDto.getDescription());
        job.setSalary(jobDto.getSalary());
        job.setLocation(jobDto.getLocation());
        job.setSkills(jobDto.getSkills());
        if (jobDto.getStatus() != null) {
            job.setStatus(Job.JobStatus.valueOf(jobDto.getStatus()));
        }
        if (jobDto.getJobType() != null) {
            job.setJobType(Job.JobType.valueOf(jobDto.getJobType()));
        }
        job.setDeadline(jobDto.getDeadline());

        return mapToDto(jobRepository.save(job));
    }

    public void deleteJob(Long id, Long recruiterId) {
        Objects.requireNonNull(id, "Job ID must not be null");
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to delete this job");
        }

        jobRepository.delete(job);
    }

    private JobDto mapToDto(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setSalary(job.getSalary());
        dto.setLocation(job.getLocation());
        dto.setSkills(job.getSkills());
        dto.setRecruiterId(job.getRecruiter().getId());
        dto.setRecruiterName(job.getRecruiter().getName());
        if (job.getStatus() != null) dto.setStatus(job.getStatus().name());
        if (job.getJobType() != null) dto.setJobType(job.getJobType().name());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setDeadline(job.getDeadline());
        return dto;
    }

    public RecruiterStatsDto getRecruiterStats(Long recruiterId) {
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        long totalJobs = jobRepository.countByRecruiterId(recruiterId);
        long activeJobs = jobRepository.countByRecruiterIdAndStatus(recruiterId, Job.JobStatus.ACTIVE);
        
        List<Application> apps = applicationRepository.findByJobRecruiterId(recruiterId);
        
        java.util.Map<String, Long> statusDist = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));
        
        java.util.Map<String, Long> appsPerJob = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getJob().getTitle(), Collectors.counting()));

        return RecruiterStatsDto.builder()
                .totalJobsPosted(totalJobs)
                .activeJobs(activeJobs)
                .totalApplicationsReceived(apps.size())
                .shortlistedCandidates(statusDist.getOrDefault("SHORTLISTED", 0L))
                .statusDistribution(statusDist)
                .applicationsPerJob(appsPerJob)
                .build();
    }
}

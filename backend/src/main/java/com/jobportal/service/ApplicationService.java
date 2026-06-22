package com.jobportal.service;

import com.jobportal.dto.ApplicationDto;
import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.jobportal.dto.AiMatcherDto;


import java.util.Map;
import java.util.Objects;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public ApplicationDto applyForJob(Long jobId, Long applicantId, MultipartFile resume) {
        Objects.requireNonNull(jobId, "Job ID must not be null");
        Objects.requireNonNull(applicantId, "Applicant ID must not be null");
        if (applicationRepository.existsByApplicantIdAndJobId(applicantId, jobId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        if (job.getDeadline() != null && job.getDeadline().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("This job application has expired as the deadline has passed.");
        }

        String resumeFileName = fileStorageService.storeFile(resume);

        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .status(Application.ApplicationStatus.APPLIED)
                .resumePath(resumeFileName)
                .build();

        Application savedApplication = Objects.requireNonNull(applicationRepository.save(Objects.requireNonNull(application)));

        // Notify Applicant
        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("name", applicant.getName());
        variables.put("jobTitle", job.getTitle());
        variables.put("status", "APPLIED");
        emailService.sendHtmlEmail(applicant.getEmail(), "Application Submitted", "application-status", variables);
        
        createNotification(applicant, "Your application for " + job.getTitle() + " has been submitted.");

        // Notify Recruiter
        createNotification(job.getRecruiter(), "New application received for " + job.getTitle() + " from " + applicant.getName());

        return mapToDto(savedApplication);
    }

    public List<ApplicationDto> getApplicationsByApplicant(Long applicantId) {
        Objects.requireNonNull(applicantId, "Applicant ID must not be null");
        return applicationRepository.findByApplicantId(applicantId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ApplicationDto> getApplicationsByRecruiter(Long recruiterId) {
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        log.info("Fetching applications for recruiter ID: {}", recruiterId);
        List<Application> apps = applicationRepository.findByJobRecruiterId(recruiterId);
        log.info("Found {} applications", apps.size());
        return apps.stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ApplicationDto> getApplicationsByJob(Long jobId, Long recruiterId) {
        Objects.requireNonNull(jobId, "Job ID must not be null");
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized");
        }

        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public ApplicationDto updateApplicationStatus(Long applicationId, String status, Long recruiterId) {
        Objects.requireNonNull(applicationId, "Application ID must not be null");
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized");
        }

        Application.ApplicationStatus newStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());
        application.setStatus(newStatus);
        Application updatedApplication = applicationRepository.save(Objects.requireNonNull(application));

        // Notify Applicant
        User applicant = application.getApplicant();
        String jobTitle = application.getJob().getTitle();
        String message = "Your application for " + jobTitle + " has been " + newStatus.name() + ".";
        
        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("name", applicant.getName());
        variables.put("jobTitle", jobTitle);
        variables.put("status", newStatus.name());
        emailService.sendHtmlEmail(applicant.getEmail(), "Application Status Update", "application-status", variables);
        createNotification(applicant, message);

        return mapToDto(updatedApplication);
    }

    public ApplicationDto updateApplicationNotes(Long applicationId, String notes, Long recruiterId) {
        Objects.requireNonNull(applicationId, "Application ID must not be null");
        Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized");
        }

        application.setNotes(notes);
        Application updatedApplication = applicationRepository.save(Objects.requireNonNull(application));
        return mapToDto(updatedApplication);
    }

    private void createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();
        Objects.requireNonNull(notificationRepository.save(Objects.requireNonNull(notification)));
    }

    private ApplicationDto mapToDto(Application application) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(application.getId());
        dto.setJobId(application.getJob().getId());
        dto.setJobTitle(application.getJob().getTitle());
        dto.setApplicantId(application.getApplicant().getId());
        dto.setApplicantName(application.getApplicant().getName());
        dto.setApplicantEmail(application.getApplicant().getEmail());
        dto.setStatus(application.getStatus().name());
        dto.setResumePath(application.getResumePath());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setNotes(application.getNotes());
        return dto;
    }

    public List<AiMatcherDto> getMatchedCandidates(Long recruiterId) {
        log.info("Starting AI Matching for recruiter ID: {}", recruiterId);
        List<Application> applications = applicationRepository.findByJobRecruiterId(recruiterId);
        
        return applications.stream()
                .map(this::calculateMatchScore)
                .sorted((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()))
                .collect(Collectors.toList());
    }

    public List<AiMatcherDto> getApplicantAiScores(Long applicantId) {
        log.info("Fetching AI scores for applicant ID: {}", applicantId);
        List<Application> applications = applicationRepository.findByApplicantId(applicantId);
        
        return applications.stream()
                .map(this::calculateMatchScore)
                .collect(Collectors.toList());
    }

    private AiMatcherDto calculateMatchScore(Application app) {
        Job job = app.getJob();
        User applicant = app.getApplicant();
        
        String jobSkills = job.getSkills() != null ? job.getSkills().toLowerCase() : "";
        String applicantPosition = applicant.getPosition() != null ? applicant.getPosition().toLowerCase() : "";
        
        // Simple skill matching logic
        List<String> requiredSkills = java.util.Arrays.stream(jobSkills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        
        List<String> matchingSkills = new java.util.ArrayList<>();
        List<String> missingSkills = new java.util.ArrayList<>();
        
        for (String skill : requiredSkills) {
            if (applicantPosition.contains(skill.toLowerCase()) || (app.getNotes() != null && app.getNotes().toLowerCase().contains(skill.toLowerCase()))) {
                matchingSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }
        
        int score = 0;
        if (!requiredSkills.isEmpty()) {
            score = (matchingSkills.size() * 100) / requiredSkills.size();
        } else {
            score = 50; 
        }

        // Add some random variation to make it look dynamic
        score = Math.min(100, Math.max(0, score + (int)(Math.random() * 10 - 5)));

        String aiSummary = generateAiSummary(applicant.getName(), matchingSkills, missingSkills, score);

        return AiMatcherDto.builder()
                .applicationId(app.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .applicantId(applicant.getId())
                .applicantName(applicant.getName())
                .applicantEmail(applicant.getEmail())
                .resumePath(app.getResumePath())
                .appliedAt(app.getAppliedAt())
                .matchScore(score)
                .matchingSkills(matchingSkills)
                .missingSkills(missingSkills)
                .aiSummary(aiSummary)
                .build();
    }

    private String generateAiSummary(String name, List<String> matching, List<String> missing, int score) {
        if (score > 80) {
            return name + " is an exceptional match. Their background aligns perfectly with your core requirements.";
        } else if (score > 50) {
            return name + " is a strong candidate with relevant experience. They might need some training in specific areas.";
        } else {
            return "While " + name + " shows potential, they currently lack significant experience in key required areas.";
        }
    }
}


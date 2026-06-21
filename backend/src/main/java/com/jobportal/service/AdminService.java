package com.jobportal.service;

import com.jobportal.dto.UserDto;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalJobs", jobRepository.count());
        stats.put("totalApplications", applicationRepository.count());
        stats.put("totalRecruiters", userRepository.countByRole(Role.RECRUITER));

        // For compatibility with RecruiterOverview
        stats.put("totalJobsPosted", jobRepository.count());
        stats.put("totalApplicationsReceived", applicationRepository.count());
        stats.put("activeJobs", jobRepository.count());
        stats.put("shortlistedCandidates", applicationRepository.countByStatus(Application.ApplicationStatus.SHORTLISTED));

        // Add status distribution
        Map<String, Long> statusDist = new HashMap<>();
        for (Application.ApplicationStatus status : Application.ApplicationStatus.values()) {
            statusDist.put(status.name(), applicationRepository.countByStatus(status));
        }
        stats.put("statusDistribution", statusDist);

        // Add applications per job (Top 10 jobs by application count)
        List<Job> allJobs = jobRepository.findAll();
        Map<String, Long> appsPerJob = allJobs.stream()
                .sorted((j1, j2) -> Integer.compare(applicationRepository.findByJobId(j2.getId()).size(), applicationRepository.findByJobId(j1.getId()).size()))
                .limit(10)
                .collect(Collectors.toMap(
                        Job::getTitle, 
                        j -> (long) applicationRepository.findByJobId(j.getId()).size(),
                        (v1, v2) -> v1,
                        HashMap::new
                ));
        stats.put("applicationsPerJob", appsPerJob);

        return stats;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto toggleUserStatus(Long userId) {
        Objects.requireNonNull(userId, "User ID must not be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(!user.isStatus());
        return mapToDto(userRepository.save(user));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.isStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

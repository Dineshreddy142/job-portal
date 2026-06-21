package com.jobportal.service;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityService {

    private final UserRepository userRepository;

    public List<User> getUnverifiedRecruiters() {
        log.info("Fetching all unverified recruiters");
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.RECRUITER && !user.isVerified())
                .toList();
    }

    public List<User> getVerifiedRecruiters() {
        log.info("Fetching all verified recruiters");
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.RECRUITER && user.isVerified())
                .toList();
    }

    @Transactional
    public void verifyRecruiter(Long recruiterId, boolean verify) {
        log.info("Updating verification status for recruiter ID: {} to {}", recruiterId, verify);
        Long id = Objects.requireNonNull(recruiterId, "Recruiter ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        
        if (user.getRole() != Role.RECRUITER) {
            throw new RuntimeException("User is not a recruiter");
        }

        user.setVerified(verify);
        userRepository.save(Objects.requireNonNull(user));
    }
}

package com.jobportal.config;

import com.jobportal.entity.Job;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.util.Objects;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@Order(2) // Run after AdminUserSeeder
@RequiredArgsConstructor
public class JobSeeder implements CommandLineRunner {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (jobRepository.count() == 0) {
            // 1. Create a Default Recruiter if not exists
            User recruiter = userRepository.findByEmail("recruiter@jobportal.com")
                    .orElseGet(() -> {
                        User u = User.builder()
                                .name("TechCorp Solutions")
                                .email("recruiter@jobportal.com")
                                .password(passwordEncoder.encode("recruiter123"))
                                .role(Role.RECRUITER)
                                .status(true)
                                .build();
                        return userRepository.save(Objects.requireNonNull(u));
                    });

            // 2. Seed Sample Jobs
            Job j1 = Job.builder()
                    .title("Senior Frontend Architect")
                    .description("Looking for a React expert with 5+ years of experience in high-scale web applications. Skills: React, Tailwind, Vite, TypeScript.")
                    .salary("₹18,00,000 - ₹24,00,000 PA")
                    .location("Remote")
                    .skills("React, Tailwind, TypeScript, Redux")
                    .recruiter(recruiter)
                    .status(Job.JobStatus.ACTIVE)
                    .jobType(Job.JobType.REMOTE)
                    .build();

            Job j2 = Job.builder()
                    .title("Backend Engineer (Java/Spring)")
                    .description("Join our core platform team. Experience with Microservices and Spring Boot is a must.")
                    .salary("₹12,00,000 - ₹18,00,000 PA")
                    .location("Bangalore, India")
                    .skills("Java, Spring Boot, MySQL, Docker")
                    .recruiter(recruiter)
                    .status(Job.JobStatus.ACTIVE)
                    .jobType(Job.JobType.FULL_TIME)
                    .build();

            Job j3 = Job.builder()
                    .title("Full Stack Web Developer")
                    .description("Building modern SaaS products. Looking for a generalist who can handle both frontend and backend.")
                    .salary("₹10,00,000 - ₹15,00,000 PA")
                    .location("Mumbai, India")
                    .skills("Next.js, Node.js, PostgreSQL, Tailwind")
                    .recruiter(recruiter)
                    .status(Job.JobStatus.ACTIVE)
                    .jobType(Job.JobType.FULL_TIME)
                    .build();

            Job j4 = Job.builder()
                    .title("UI/UX Designer")
                    .description("Creative designer needed for mobile-first application. Must have a strong portfolio in Figma.")
                    .salary("₹80,000 - ₹1,20,000 per month")
                    .location("Remote")
                    .skills("Figma, Adobe XD, Prototyping")
                    .recruiter(recruiter)
                    .status(Job.JobStatus.ACTIVE)
                    .jobType(Job.JobType.CONTRACT)
                    .build();

            Job j5 = Job.builder()
                    .title("Product Management Intern")
                    .description("Help us shape the future of talent acquisition. Great opportunity for students.")
                    .salary("₹25,000 per month")
                    .location("Hyderabad, India")
                    .skills("Analytics, Communication, Agile")
                    .recruiter(recruiter)
                    .status(Job.JobStatus.ACTIVE)
                    .jobType(Job.JobType.PART_TIME)
                    .build();

            jobRepository.saveAll(Objects.requireNonNull(Arrays.asList(j1, j2, j3, j4, j5)));
            System.out.println("✅ Sample Jobs Seeded Successfully!");
        }
    }
}

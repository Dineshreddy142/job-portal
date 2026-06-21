package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiterId(Long recruiterId);
    List<Job> findByLocationContainingIgnoreCaseOrTitleContainingIgnoreCase(String location, String title);
    
    long countByRecruiterId(Long recruiterId);
    long countByRecruiterIdAndStatus(Long recruiterId, Job.JobStatus status);
}

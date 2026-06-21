package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantId(Long applicantId);
    List<Application> findByJobId(Long jobId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Application a WHERE a.job.recruiter.id = :recruiterId")
    List<Application> findByJobRecruiterId(@org.springframework.data.repository.query.Param("recruiterId") Long recruiterId);
    
    boolean existsByApplicantIdAndJobId(Long applicantId, Long jobId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiter.id = :recruiterId")
    long countApplicationsByRecruiterId(@org.springframework.data.repository.query.Param("recruiterId") Long recruiterId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiter.id = :recruiterId AND a.status = :status")
    long countApplicationsByRecruiterIdAndStatus(@org.springframework.data.repository.query.Param("recruiterId") Long recruiterId, @org.springframework.data.repository.query.Param("status") Application.ApplicationStatus status);

    long countByStatus(Application.ApplicationStatus status);
}

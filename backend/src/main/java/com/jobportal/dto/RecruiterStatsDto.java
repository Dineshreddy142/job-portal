package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterStatsDto {
    private long totalJobsPosted;
    private long totalApplicationsReceived;
    private long activeJobs;
    private long shortlistedCandidates;
    private Map<String, Long> applicationsPerJob;
    private Map<String, Long> statusDistribution;
}

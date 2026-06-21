package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatcherDto {
    private Long id;
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String resumePath;
    private LocalDateTime appliedAt;
    private int matchScore; // 0 to 100
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String aiSummary;
}

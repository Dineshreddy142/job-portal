package com.jobportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String status;
    private String resumePath;
    private LocalDateTime appliedAt;
    private String notes;
}

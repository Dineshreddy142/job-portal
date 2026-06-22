package com.jobportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDto {
    private Long id;
    private Long reporterId;
    private Long reportedJobId;
    private Long reportedUserId;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    
    // Additional fields for admin view
    private String reporterName;
    private String reportedJobTitle;
    private String reportedUserName;
}

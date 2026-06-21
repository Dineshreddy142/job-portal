package com.jobportal.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class JobDto {
    private Long id;
    
    @NotBlank
    private String title;
    
    @NotBlank
    private String description;
    
    private String salary;
    private String location;
    private String skills;
    private Long recruiterId;
    private String recruiterName;
    private String status;
    private String jobType;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;
}

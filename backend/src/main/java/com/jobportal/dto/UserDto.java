package com.jobportal.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String position;
    private String resumePath;
    private String profilePicture;
    private String companyIdCard;
    private Boolean isVerified;
    private boolean notifyByEmail;
    private boolean status;
    private LocalDateTime createdAt;
}

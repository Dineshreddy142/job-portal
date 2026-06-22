package com.jobportal.service;

import com.jobportal.dto.ReportDto;
import com.jobportal.entity.Job;
import com.jobportal.entity.Report;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ReportRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public void submitReport(ReportDto request) {
        Report report = new Report();
        report.setReporterId(request.getReporterId());
        report.setReportedJobId(request.getReportedJobId());
        report.setReportedUserId(request.getReportedUserId());
        report.setReason(request.getReason());
        reportRepository.save(report);
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void updateReportStatus(Long id, String status) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        reportRepository.save(report);
    }

    private ReportDto mapToDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        dto.setReporterId(report.getReporterId());
        dto.setReportedJobId(report.getReportedJobId());
        dto.setReportedUserId(report.getReportedUserId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());

        userRepository.findById(report.getReporterId()).ifPresent(user -> dto.setReporterName(user.getName()));
        
        if (report.getReportedJobId() != null) {
            jobRepository.findById(report.getReportedJobId()).ifPresent(job -> dto.setReportedJobTitle(job.getTitle()));
        }
        
        if (report.getReportedUserId() != null) {
            userRepository.findById(report.getReportedUserId()).ifPresent(user -> dto.setReportedUserName(user.getName()));
        }

        return dto;
    }
}

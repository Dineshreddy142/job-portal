package com.jobportal.controller;

import com.jobportal.dto.ReportDto;
import com.jobportal.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(@RequestBody ReportDto request) {
        reportService.submitReport(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECURITY_ADMIN')")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PutMapping("/admin/reports/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECURITY_ADMIN')")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestParam String status) {
        reportService.updateReportStatus(id, status);
        return ResponseEntity.ok().build();
    }
}

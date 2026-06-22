package com.jobportal.controller;

import com.jobportal.entity.EmailMessage;
import com.jobportal.service.MailCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.jobportal.service.UserGmailService;
import com.jobportal.security.SecurityUtils;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/mails")
public class MailController {

    @Autowired
    private MailCollectionService mailCollectionService;

    @Autowired
    private UserGmailService userGmailService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<EmailMessage>> getMails(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String filter) {
        
        // Default to user 1 for MVP if not provided or parsing from auth token
        Long id = (userId != null) ? userId : 1L;
        List<EmailMessage> emails = mailCollectionService.getEmailsForUser(id, filter);
        return ResponseEntity.ok(emails);
    }
    
    @GetMapping("/gmail")
    public ResponseEntity<List<EmailMessage>> getPersonalGmail(
            @RequestParam Long userId,
            Authentication authentication) {
        
        securityUtils.verifyOwnership(authentication, userId);
        List<EmailMessage> emails = userGmailService.fetchJobRelatedEmails(userId);
        return ResponseEntity.ok(emails);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<EmailMessage> markAsRead(@PathVariable Long id) {
        EmailMessage updated = mailCollectionService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }
}

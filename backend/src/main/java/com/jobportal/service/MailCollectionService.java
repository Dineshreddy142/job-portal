package com.jobportal.service;

import com.jobportal.entity.EmailMessage;
import com.jobportal.repository.EmailMessageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class MailCollectionService {

    @Autowired
    private EmailMessageRepository emailMessageRepository;

    @Value("${mail.imap.host:}")
    private String imapHost;

    @Value("${mail.imap.username:}")
    private String imapUsername;

    @Value("${mail.imap.password:}")
    private String imapPassword;

    // Hardcoded user ID for MVP
    private final Long DEFAULT_USER_ID = 1L;

    @PostConstruct
    public void initMockData() {
        if (emailMessageRepository.count() == 0) {
            // Insert some mock emails for testing the UI
            EmailMessage msg1 = EmailMessage.builder()
                    .userId(DEFAULT_USER_ID)
                    .sender("hr@techcorp.com")
                    .subject("Interview Invitation - Software Engineer")
                    .body("Dear candidate, we would like to invite you for an interview for the Software Engineer role.")
                    .receivedAt(LocalDateTime.now().minusDays(1))
                    .isJobRelated(true)
                    .isRead(false)
                    .build();

            EmailMessage msg2 = EmailMessage.builder()
                    .userId(DEFAULT_USER_ID)
                    .sender("newsletter@dailytech.com")
                    .subject("Top 10 Tech Trends in 2026")
                    .body("Check out the top 10 trends in technology for the upcoming year.")
                    .receivedAt(LocalDateTime.now().minusHours(5))
                    .isJobRelated(false)
                    .isRead(true)
                    .build();

            EmailMessage msg3 = EmailMessage.builder()
                    .userId(DEFAULT_USER_ID)
                    .sender("recruiter@startup.io")
                    .subject("Job Offer: Senior Frontend Developer")
                    .body("Congratulations! We are thrilled to offer you the position.")
                    .receivedAt(LocalDateTime.now().minusMinutes(30))
                    .isJobRelated(true)
                    .isRead(false)
                    .build();

            emailMessageRepository.saveAll(Arrays.asList(msg1, msg2, msg3));
        }
    }

    // Every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void fetchNewEmails() {
        if (imapHost.isEmpty() || imapUsername.isEmpty() || imapPassword.isEmpty()) {
            System.out.println("IMAP credentials not configured. Skipping real mail fetch.");
            return;
        }

        // Real IMAP logic would go here using jakarta.mail
        /*
        Properties props = new Properties();
        props.setProperty("mail.store.protocol", "imaps");
        try {
            Session session = Session.getInstance(props, null);
            Store store = session.getStore();
            store.connect(imapHost, imapUsername, imapPassword);
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);
            Message[] messages = inbox.getMessages();
            // Process messages...
            inbox.close(false);
            store.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        */
        System.out.println("Fetching new emails from " + imapHost + "...");
    }

    public List<EmailMessage> getEmailsForUser(Long userId, String filter) {
        if ("job-related".equalsIgnoreCase(filter)) {
            return emailMessageRepository.findByUserIdAndIsJobRelatedOrderByReceivedAtDesc(userId, true);
        }
        return emailMessageRepository.findByUserIdOrderByReceivedAtDesc(userId);
    }
    
    public EmailMessage markAsRead(Long emailId) {
        return emailMessageRepository.findById(emailId).map(email -> {
            email.setRead(true);
            return emailMessageRepository.save(email);
        }).orElseThrow(() -> new RuntimeException("Email not found"));
    }
}

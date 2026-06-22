package com.jobportal.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.jobportal.entity.EmailMessage;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserGmailService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    private final UserRepository userRepository;

    public List<EmailMessage> fetchJobRelatedEmails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getGoogleRefreshToken() == null || user.getGoogleRefreshToken().isEmpty()) {
            throw new RuntimeException("GMAIL_NOT_LINKED");
        }

        try {
            // Build credential using the stored refresh token
            GoogleCredential credential = new GoogleCredential.Builder()
                    .setTransport(new NetHttpTransport())
                    .setJsonFactory(GsonFactory.getDefaultInstance())
                    .setClientSecrets(googleClientId, googleClientSecret)
                    .build()
                    .setRefreshToken(user.getGoogleRefreshToken());

            // Initialize Gmail API client
            Gmail gmail = new Gmail.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    credential)
                    .setApplicationName("Job Portal")
                    .build();

            // Query to find job-related emails using expanded keyword list
            String query = "subject:(\"interview\" OR \"offer\" OR \"application\" OR \"job\" OR \"career\" " +
                    "OR \"opportunity\" OR \"resume\" OR \"hiring\" OR \"recruitment\" OR \"internship\" " +
                    "OR \"assessment\" OR \"hackathon\")";

            ListMessagesResponse response = gmail.users().messages().list("me")
                    .setQ(query)
                    .setMaxResults(20L)
                    .execute();

            List<Message> messages = response.getMessages();
            List<EmailMessage> emailMessages = new ArrayList<>();

            if (messages != null) {
                for (Message messageStub : messages) {
                    Message message = gmail.users().messages().get("me", messageStub.getId())
                            .setFormat("metadata")
                            .setMetadataHeaders(List.of("From", "Subject", "Date"))
                            .execute();

                    String from = "";
                    String subject = "";
                    
                    if (message.getPayload() != null && message.getPayload().getHeaders() != null) {
                        for (MessagePartHeader header : message.getPayload().getHeaders()) {
                            if ("From".equalsIgnoreCase(header.getName())) {
                                from = header.getValue();
                            } else if ("Subject".equalsIgnoreCase(header.getName())) {
                                subject = header.getValue();
                            }
                        }
                    }

                    // Parse internalDate
                    LocalDateTime receivedAt = LocalDateTime.now();
                    if (message.getInternalDate() != null) {
                        receivedAt = LocalDateTime.ofInstant(
                                Instant.ofEpochMilli(message.getInternalDate()), ZoneId.systemDefault());
                    }

                    // Is read?
                    boolean isRead = true;
                    if (message.getLabelIds() != null && message.getLabelIds().contains("UNREAD")) {
                        isRead = false;
                    }

                    // We will not store the body snippet to save performance and since we just need the list view,
                    // but we will provide the snippet.
                    EmailMessage emailMsg = EmailMessage.builder()
                            .id(null) // Not saving to DB in this implementation
                            .userId(userId)
                            .sender(from)
                            .subject(subject)
                            .body(message.getSnippet())
                            .receivedAt(receivedAt)
                            .isJobRelated(true)
                            .isRead(isRead)
                            .build();

                    emailMessages.add(emailMsg);
                }
            }

            return emailMessages;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch emails from Gmail: " + e.getMessage(), e);
        }
    }
}

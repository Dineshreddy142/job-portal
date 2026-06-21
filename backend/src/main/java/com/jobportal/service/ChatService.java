package com.jobportal.service;

import com.jobportal.dto.ChatMessageDto;
import com.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final JobRepository jobRepository;
    private final com.jobportal.repository.UserRepository userRepository;
    private final com.jobportal.repository.ApplicationRepository applicationRepository;

    public ChatMessageDto getAiResponse(String userMessage, Long userId) {
        String msg = userMessage.toLowerCase();
        String response;

        String userName = "there";
        String userPosition = "";
        
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                // We use the name from the DB for accuracy
            });
            // Let's assume we fetch the user for better personalization
            com.jobportal.entity.User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                userName = user.getName();
                userPosition = user.getPosition();
            }
        }

        if (msg.contains("who am i") || msg.contains("my profile")) {
            if (userId != null) {
                response = "You are " + userName + (userPosition != null ? ", working as " + userPosition : "") + ". Your email is registered in our database.";
            } else {
                response = "I'm not sure who you are. Please log in so I can access your profile data!";
            }
        } else if (msg.contains("status") || msg.contains("application")) {
            if (userId != null) {
                List<com.jobportal.entity.Application> apps = applicationRepository.findByApplicantId(userId);
                if (apps.isEmpty()) {
                    response = "You haven't applied for any jobs yet, " + userName + ". Would you like me to help you find some?";
                } else {
                    StringBuilder sb = new StringBuilder("Here is the status of your recent applications, " + userName + ":\n");
                    for (com.jobportal.entity.Application app : apps) {
                        sb.append("- **").append(app.getJob().getTitle()).append("**: ").append(app.getStatus()).append("\n");
                    }
                    response = sb.toString();
                }
            } else {
                response = "Please log in to track your application status!";
            }
        } else if (msg.contains("account") || msg.contains("stats") || msg.contains("performance") || msg.contains("shortlisted") || (msg.contains("how many") && msg.contains("member"))) {
            if (userId != null) {
                com.jobportal.entity.User user = userRepository.findById(userId).orElse(null);
                if (user != null && "RECRUITER".equals(user.getRole().name())) {
                    long jobCount = jobRepository.countByRecruiterId(userId);
                    long shortlistedCount = applicationRepository.countApplicationsByRecruiterIdAndStatus(userId, com.jobportal.entity.Application.ApplicationStatus.SHORTLISTED);
                    long totalApps = applicationRepository.countApplicationsByRecruiterId(userId);
                    
                    response = "Hello " + userName + "! Here are your recruiter account stats:\n" +
                               "- **Jobs Posted**: " + jobCount + "\n" +
                               "- **Total Applications**: " + totalApps + "\n" +
                               "- **Shortlisted Candidates**: " + shortlistedCount + "\n" +
                               "You are doing a great job managing your pipeline!";
                } else if (user != null) {
                    response = "Hello " + userName + "! You are currently logged in as a " + user.getRole() + ". How can I help you today?";
                } else {
                    response = "I couldn't find your account details.";
                }
            } else {
                response = "Please log in to view your account statistics!";
            }
        } else if (msg.contains("jobs") || msg.contains("hiring") || msg.contains("openings")) {
            long count = jobRepository.count();
            response = "Hello " + userName + "! We currently have " + count + " active job openings. Since you are interested in " + (userPosition != null ? userPosition : "new opportunities") + ", I recommend checking the latest listings!";
        } else if (msg.contains("apply")) {
            response = "To apply for a job, " + userName + ", just click on any job card and upload your resume.";
        } else if (msg.contains("resume")) {
            response = "I'd love to help you improve your resume, " + userName + "! 📄\n\n" +
                       "I can analyze your current CV for keywords, formatting, and impact. \n\n" +
                       "**Please upload your resume file (PDF or TXT)** using the paperclip icon below, and I'll give you a detailed breakdown of how to make it stand out!";
        } else if (msg.contains("project")) {
            response = "Improving your projects is a great way to show your skills, " + userName + "! 🚀\n\n" +
                       "I recommend: \n" +
                       "1. **Documentation**: Write a clear README.md.\n" +
                       "2. **Clean Code**: Ensure your code is modular and commented.\n" +
                       "3. **Showcase**: Host it on GitHub or a live demo site.\n\n" +
                       "Which project are you currently working on? I can give you specific advice!";
        } else if (msg.contains("interview")) {
            response = "Preparation is everything, " + userName + "! I recommend practicing common behavioral questions like 'Tell me about a time you faced a challenge'. Would you like a list of top questions for your role?";
        } else if (msg.contains("candidate") || msg.contains("hiring")) {
            response = "For recruiters, I can help find the top candidates based on skill matching. Currently, we have several highly-rated profiles in our database matching current job postings.";
        } else if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey")) {
            response = "Hello " + userName + "! I am your Smart Career Assistant. How can I help you find your dream job today?";
        } else {
            response = "I'm still learning, " + userName + "! But I can help you find jobs, explain the application process, or help you update your profile. What would you like to know?";
        }

        return new ChatMessageDto(response, "AI", userId);
    }
}

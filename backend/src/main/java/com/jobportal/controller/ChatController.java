package com.jobportal.controller;

import com.jobportal.dto.ChatMessageDto;
import com.jobportal.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatMessageDto> chat(@RequestBody ChatMessageDto userMessage) {
        return ResponseEntity.ok(chatService.getAiResponse(userMessage.getMessage(), userMessage.getUserId()));
    }
}

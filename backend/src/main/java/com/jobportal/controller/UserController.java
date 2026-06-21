package com.jobportal.controller;

import com.jobportal.dto.UserDto;
import com.jobportal.security.SecurityUtils;
import com.jobportal.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.Objects;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<UserDto> uploadResume(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        return ResponseEntity.ok(userService.uploadResume(id, file));
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<UserDto> uploadProfilePicture(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        return ResponseEntity.ok(userService.uploadProfilePicture(id, file));
    }

    @PostMapping("/{id}/company-id-card")
    public ResponseEntity<UserDto> uploadCompanyIdCard(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        return ResponseEntity.ok(userService.uploadCompanyIdCard(id, file));
    }

    @GetMapping("/company-id-card/{id}")
    public ResponseEntity<byte[]> getCompanyIdCard(@PathVariable Long id, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        byte[] image = userService.getCompanyIdCard(id);
        if (image == null || image.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(image);
    }

    @GetMapping("/profile-picture/{id}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable Long id, Authentication authentication) {
        Objects.requireNonNull(id, "User ID must not be null");
        securityUtils.verifyOwnership(authentication, id);
        byte[] image = userService.getProfilePicture(id);
        if (image == null || image.length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = userService.getProfilePictureMediaType(id);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(image);
    }
}

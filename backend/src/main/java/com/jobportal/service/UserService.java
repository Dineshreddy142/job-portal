package com.jobportal.service;

import com.jobportal.dto.UserDto;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final Set<String> ALLOWED_RESUME_EXTENSIONS = Set.of(".pdf", ".doc", ".docx");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB

    public UserDto updateUser(Long id, UserDto userDto) {
        Long userId = Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDto.getName() != null && !userDto.getName().isEmpty()) {
            user.setName(userDto.getName());
        }
        if (userDto.getPosition() != null) {
            user.setPosition(userDto.getPosition());
        }
        if (userDto.getResumePath() != null) {
            user.setResumePath(userDto.getResumePath());
        }
        if (userDto.getProfilePicture() != null) {
            user.setProfilePicture(userDto.getProfilePicture());
        }
        if (userDto.getCompanyIdCard() != null) {
            user.setCompanyIdCard(userDto.getCompanyIdCard());
        }
        user.setNotifyByEmail(userDto.isNotifyByEmail());

        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    public UserDto getUserById(Long id) {
        Long userId = Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public void deleteUser(Long id) {
        Long userId = Objects.requireNonNull(id, "User ID must not be null");
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    public UserDto uploadResume(Long id, MultipartFile file) {
        validateFile(file, MAX_RESUME_SIZE, ALLOWED_RESUME_EXTENSIONS);
        try {
            String extension = getFileExtension(file.getOriginalFilename());
            Path uploadDir = Paths.get("uploads", "resumes");
            createDirectoryIfNotExists(uploadDir);

            String safeFilename = "resume_" + id + "_" + UUID.randomUUID() + extension;
            Path destination = uploadDir.resolve(safeFilename).toAbsolutePath().normalize();
            verifyPathTraversal(destination, uploadDir);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            UserDto dto = new UserDto();
            dto.setResumePath(destination.toString());
            return updateUser(id, dto);
        } catch (IOException e) {
            log.error("Failed to upload resume for user {}", id, e);
            throw new RuntimeException("Failed to save resume file", e);
        }
    }

    public UserDto uploadProfilePicture(Long id, MultipartFile file) {
        validateFile(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_EXTENSIONS);
        try {
            String extension = getFileExtension(file.getOriginalFilename());
            Path uploadDir = Paths.get("uploads", "profile-pictures");
            createDirectoryIfNotExists(uploadDir);

            String safeFilename = "profile_" + id + extension;
            Path destination = uploadDir.resolve(safeFilename).toAbsolutePath().normalize();
            verifyPathTraversal(destination, uploadDir);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            UserDto dto = new UserDto();
            dto.setProfilePicture("/api/users/profile-picture/" + id);
            return updateUser(id, dto);
        } catch (IOException e) {
            log.error("Failed to upload profile picture for user {}", id, e);
            throw new RuntimeException("Failed to save profile picture", e);
        }
    }

    public UserDto uploadCompanyIdCard(Long id, MultipartFile file) {
        validateFile(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_EXTENSIONS);
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setCompanyIdCardImage(file.getBytes());
            user.setCompanyIdCard("stored_in_db");

            userRepository.save(user);
            return getUserById(id);
        } catch (IOException e) {
            log.error("Failed to upload company ID card for user {}", id, e);
            throw new RuntimeException("Failed to save company ID card", e);
        }
    }

    public byte[] getCompanyIdCard(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getCompanyIdCardImage();
    }

    public byte[] getProfilePicture(Long id) {
        try {
            Path uploadDir = Paths.get("uploads", "profile-pictures");
            if (!Files.exists(uploadDir)) return null;

            Optional<Path> fileOpt = Files.list(uploadDir)
                    .filter(p -> p.getFileName().toString().startsWith("profile_" + id))
                    .findFirst();

            if (!fileOpt.isPresent()) return null;

            return Files.readAllBytes(fileOpt.get());
        } catch (IOException e) {
            log.error("Failed to read profile picture for user {}", id, e);
            throw new RuntimeException("Failed to read profile picture", e);
        }
    }

    public MediaType getProfilePictureMediaType(Long id) {
        try {
            Path uploadDir = Paths.get("uploads", "profile-pictures");
            if (!Files.exists(uploadDir)) return MediaType.IMAGE_JPEG;

            Optional<Path> fileOpt = Files.list(uploadDir)
                    .filter(p -> p.getFileName().toString().startsWith("profile_" + id))
                    .findFirst();

            if (!fileOpt.isPresent()) return MediaType.IMAGE_JPEG;

            String filename = fileOpt.get().getFileName().toString().toLowerCase();
            if (filename.endsWith(".png")) return MediaType.IMAGE_PNG;
            else if (filename.endsWith(".gif")) return MediaType.IMAGE_GIF;
            else if (filename.endsWith(".webp")) return MediaType.valueOf("image/webp");

            return MediaType.IMAGE_JPEG;
        } catch (IOException e) {
            return MediaType.IMAGE_JPEG;
        }
    }

    // --- Private Helper Methods ---

    private void validateFile(MultipartFile file, long maxSize, Set<String> allowedExtensions) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit");
        }
        String extension = getFileExtension(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file extension. Allowed: " + allowedExtensions);
        }
    }

    private void createDirectoryIfNotExists(Path uploadDir) throws IOException {
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    private void verifyPathTraversal(Path destination, Path uploadDir) {
        if (!destination.startsWith(uploadDir.toAbsolutePath().normalize())) {
            throw new SecurityException("Path traversal attempt detected");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        String cleanName = filename.replace("\\", "/");
        if (cleanName.contains("/")) {
            cleanName = cleanName.substring(cleanName.lastIndexOf("/") + 1);
        }
        return cleanName.substring(cleanName.lastIndexOf(".")).toLowerCase();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .position(user.getPosition())
                .resumePath(user.getResumePath())
                .profilePicture(user.getProfilePicture())
                .companyIdCard(user.getCompanyIdCard())
                .isVerified(user.isVerified())
                .notifyByEmail(user.isNotifyByEmail())
                .status(user.isStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

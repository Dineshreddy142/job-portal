package com.jobportal.security;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Utility to extract the authenticated user's ID from JWT claims,
 * preventing IDOR attacks by ensuring controllers use the identity
 * from the token rather than user-supplied path/query parameters.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    /**
     * Extract the authenticated user's database ID from the JWT token.
     * The userId was embedded as a claim when the token was issued.
     */
    public Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return user.getId();
    }

    /**
     * Verify that the requested resource belongs to the authenticated user.
     * Throws RuntimeException if they don't match (unless user is ADMIN).
     */
    public void verifyOwnership(Authentication authentication, Long requestedUserId) {
        Long authenticatedUserId = getAuthenticatedUserId(authentication);
        if (!authenticatedUserId.equals(requestedUserId)) {
            // Check if user is admin or security admin
            boolean hasAccess = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SECURITY_ADMIN"));
            if (!hasAccess) {
                throw new SecurityException("Access denied: you can only access your own resources");
            }
        }
    }
}

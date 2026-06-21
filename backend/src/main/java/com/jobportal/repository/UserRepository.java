package com.jobportal.repository;

import com.jobportal.entity.User;
import com.jobportal.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    java.util.List<User> findByRole(Role role);
}

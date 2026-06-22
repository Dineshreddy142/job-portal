package com.jobportal.repository;

import com.jobportal.entity.EmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessage, Long> {
    List<EmailMessage> findByUserIdOrderByReceivedAtDesc(Long userId);
    List<EmailMessage> findByUserIdAndIsJobRelatedOrderByReceivedAtDesc(Long userId, boolean isJobRelated);
}

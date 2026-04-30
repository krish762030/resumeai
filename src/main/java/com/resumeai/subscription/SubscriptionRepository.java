package com.resumeai.subscription;

import com.resumeai.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, SubscriptionStatus status);
}

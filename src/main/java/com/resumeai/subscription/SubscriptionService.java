package com.resumeai.subscription;

import com.resumeai.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public PlanType resolvePlan(User user) {
        return subscriptionRepository.findFirstByUserAndStatusOrderByCreatedAtDesc(user, SubscriptionStatus.ACTIVE)
                .filter(subscription -> subscription.getEndDate() == null || !subscription.getEndDate().isBefore(LocalDate.now()))
                .map(Subscription::getPlanName)
                .orElse(PlanType.FREE);
    }

    public boolean hasPremiumAccess(User user) {
        return resolvePlan(user) != PlanType.FREE;
    }
}

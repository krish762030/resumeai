package com.resumeai.usagelimit;

import com.resumeai.subscription.PlanType;
import com.resumeai.subscription.SubscriptionService;
import com.resumeai.user.User;
import com.resumeai.user.UserService;
import com.resumeai.usagelimit.dto.UserUsageLimitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserUsageLimitService {

    private final UserUsageLimitRepository usageLimitRepository;
    private final UserService userService;
    private final SubscriptionService subscriptionService;

    @Transactional
    public UserUsageLimit getOrCreateCurrentUserLimit() {
        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        UserUsageLimit usageLimit = usageLimitRepository.findByUser(user)
                .orElseGet(() -> usageLimitRepository.save(UserUsageLimit.builder()
                        .user(user)
                        .freeResumeEditsUsed(0)
                        .freeDownloadsUsed(0)
                        .planType(planType)
                        .build()));
        usageLimit.setPlanType(planType);
        return usageLimitRepository.save(usageLimit);
    }

    @Transactional
    public void incrementFreeEditUsageIfNeeded(User user) {
        if (subscriptionService.hasPremiumAccess(user)) {
            return;
        }
        UserUsageLimit usageLimit = usageLimitRepository.findByUser(user)
                .orElseGet(() -> usageLimitRepository.save(UserUsageLimit.builder()
                        .user(user)
                        .freeResumeEditsUsed(0)
                        .freeDownloadsUsed(0)
                        .planType(PlanType.FREE)
                        .build()));
        usageLimit.setPlanType(PlanType.FREE);
        usageLimit.setFreeResumeEditsUsed(usageLimit.getFreeResumeEditsUsed() + 1);
        usageLimitRepository.save(usageLimit);
    }

    public UserUsageLimitResponse getCurrentUsage() {
        UserUsageLimit usageLimit = getOrCreateCurrentUserLimit();
        return new UserUsageLimitResponse(
                usageLimit.getPlanType().name(),
                usageLimit.getFreeResumeEditsUsed(),
                usageLimit.getFreeDownloadsUsed(),
                usageLimit.getPlanType() != PlanType.FREE
        );
    }
}

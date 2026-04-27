package com.resumeai.usagelimit.dto;

public record UserUsageLimitResponse(
        String planType,
        int freeResumeEditsUsed,
        int freeDownloadsUsed,
        boolean premium
) {
}

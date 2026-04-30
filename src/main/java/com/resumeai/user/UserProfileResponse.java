package com.resumeai.user;

import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String role,
        Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}

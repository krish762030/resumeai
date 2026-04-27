package com.resumeai.auth.dto;

import com.resumeai.user.User;

public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        String role
) {
    public static AuthResponse from(String token, User user) {
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}

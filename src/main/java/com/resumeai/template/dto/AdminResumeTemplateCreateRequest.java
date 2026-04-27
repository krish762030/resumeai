package com.resumeai.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminResumeTemplateCreateRequest(
        @NotBlank String name,
        @NotBlank String category,
        @NotNull Boolean atsFriendly,
        @NotNull Boolean premium
) {
}

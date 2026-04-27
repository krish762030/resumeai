package com.resumeai.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminResumeTemplateCreateRequest(
        @NotBlank String name,
        @NotBlank String category,
        String roleType,
        String experienceLevel,
        String layoutType,
        String styleType,
        @NotNull Boolean atsFriendly,
        @NotNull Boolean premium,
        String templateKey,
        String cssTemplatePath,
        String supportedSectionsJson,
        String tagsJson
) {
}

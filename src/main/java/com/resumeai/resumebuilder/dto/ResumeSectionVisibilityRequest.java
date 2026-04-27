package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotNull;

public record ResumeSectionVisibilityRequest(
        @NotNull(message = "Visibility is required")
        Boolean isVisible
) {
}

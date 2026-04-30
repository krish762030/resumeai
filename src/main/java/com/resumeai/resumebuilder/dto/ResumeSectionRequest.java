package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResumeSectionRequest(
        @NotBlank(message = "Section type is required")
        String sectionType,
        @NotBlank(message = "Section title is required")
        String sectionTitle,
        @NotNull(message = "Visibility is required")
        Boolean isVisible,
        @NotBlank(message = "Content JSON is required")
        String contentJson
) {
}

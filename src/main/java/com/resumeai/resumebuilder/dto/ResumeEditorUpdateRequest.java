package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResumeEditorUpdateRequest(
        @NotNull(message = "Template is required")
        Long templateId,
        @NotBlank(message = "Title is required")
        String title
) {
}

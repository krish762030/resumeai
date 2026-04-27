package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

public record ResumeThemeUpdateRequest(
        @NotBlank(message = "Theme JSON is required")
        String themeJson
) {
}

package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotNull;

public record ResumeTemplateSwitchRequest(
        @NotNull(message = "templateId is required")
        Long templateId
) {
}

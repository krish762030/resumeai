package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotNull;

public record ResumeSectionOrderItem(
        @NotNull(message = "Section id is required")
        Long sectionId,
        @NotNull(message = "Section order is required")
        Integer sectionOrder
) {
}

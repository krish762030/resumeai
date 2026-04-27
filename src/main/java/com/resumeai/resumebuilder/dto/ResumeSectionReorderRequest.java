package com.resumeai.resumebuilder.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ResumeSectionReorderRequest(
        @NotEmpty(message = "Section order items are required")
        List<ResumeSectionOrderItem> items
) {
}

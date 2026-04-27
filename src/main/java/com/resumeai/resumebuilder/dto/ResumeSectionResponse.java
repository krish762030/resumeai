package com.resumeai.resumebuilder.dto;

import com.resumeai.resumebuilder.ResumeSection;

import java.time.Instant;

public record ResumeSectionResponse(
        Long id,
        String sectionType,
        String sectionTitle,
        int sectionOrder,
        boolean isVisible,
        String contentJson,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResumeSectionResponse from(ResumeSection section) {
        return new ResumeSectionResponse(
                section.getId(),
                section.getSectionType(),
                section.getSectionTitle(),
                section.getSectionOrder(),
                section.isVisible(),
                section.getContentJson(),
                section.getCreatedAt(),
                section.getUpdatedAt()
        );
    }
}

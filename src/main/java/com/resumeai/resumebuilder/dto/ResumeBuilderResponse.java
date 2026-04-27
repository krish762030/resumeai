package com.resumeai.resumebuilder.dto;

import com.resumeai.resumebuilder.UserGeneratedResume;
import com.resumeai.subscription.PlanType;

import java.time.Instant;

public record ResumeBuilderResponse(
        Long id,
        Long templateId,
        String templateName,
        String title,
        String resumeDataJson,
        String generatedHtml,
        String generatedPdfUrl,
        int editCount,
        int downloadCount,
        String planType,
        boolean premiumTemplate,
        boolean canEdit,
        boolean watermarkEnabled,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResumeBuilderResponse from(UserGeneratedResume resume, PlanType planType, boolean canEdit, boolean watermarkEnabled) {
        return new ResumeBuilderResponse(
                resume.getId(),
                resume.getTemplate().getId(),
                resume.getTemplate().getName(),
                resume.getTitle(),
                resume.getResumeDataJson(),
                resume.getGeneratedHtml(),
                resume.getGeneratedPdfUrl(),
                resume.getEditCount(),
                resume.getDownloadCount(),
                planType.name(),
                resume.getTemplate().isPremium(),
                canEdit,
                watermarkEnabled,
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}

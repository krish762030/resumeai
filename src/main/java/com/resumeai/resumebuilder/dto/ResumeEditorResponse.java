package com.resumeai.resumebuilder.dto;

import com.resumeai.resumebuilder.ResumeEditorStatus;
import com.resumeai.resumebuilder.ResumeSection;
import com.resumeai.resumebuilder.UserGeneratedResume;
import com.resumeai.subscription.PlanType;

import java.time.Instant;
import java.util.List;

public record ResumeEditorResponse(
        Long id,
        Long templateId,
        String templateName,
        String templateKey,
        String templateLayoutType,
        String templateStyleType,
        String templateSupportedSectionsJson,
        String title,
        String themeJson,
        String status,
        int editCount,
        int downloadCount,
        String generatedHtml,
        String generatedPdfUrl,
        String planType,
        boolean premiumTemplate,
        boolean canEdit,
        boolean watermarkEnabled,
        int hiddenUnsupportedSectionCount,
        List<String> hiddenUnsupportedSections,
        List<ResumeSectionResponse> sections,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResumeEditorResponse from(
            UserGeneratedResume resume,
            List<ResumeSection> sections,
            PlanType planType,
            boolean canEdit,
            boolean watermarkEnabled,
            List<String> hiddenUnsupportedSections
    ) {
        return new ResumeEditorResponse(
                resume.getId(),
                resume.getTemplate().getId(),
                resume.getTemplate().getName(),
                resume.getTemplate().getTemplateKey(),
                resume.getTemplate().getLayoutType(),
                resume.getTemplate().getStyleType(),
                resume.getTemplate().getSupportedSectionsJson(),
                resume.getTitle(),
                resume.getThemeJson(),
                resume.getStatus() == null ? ResumeEditorStatus.DRAFT.name() : resume.getStatus().name(),
                resume.getEditCount(),
                resume.getDownloadCount(),
                resume.getGeneratedHtml(),
                resume.getGeneratedPdfUrl(),
                planType.name(),
                resume.getTemplate().isPremium(),
                canEdit,
                watermarkEnabled,
                hiddenUnsupportedSections.size(),
                hiddenUnsupportedSections,
                sections.stream().map(ResumeSectionResponse::from).toList(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}

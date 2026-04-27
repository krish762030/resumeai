package com.resumeai.template.dto;

import com.resumeai.template.ResumeTemplate;

public record ResumeTemplateDetailResponse(
        Long id,
        String name,
        String category,
        String roleType,
        String experienceLevel,
        String layoutType,
        String styleType,
        boolean atsFriendly,
        String tagsJson,
        String previewImageUrl,
        String templateKey,
        String htmlTemplatePath,
        String cssTemplatePath,
        String supportedSectionsJson,
        String htmlTemplateContent,
        boolean premium
) {
    public static ResumeTemplateDetailResponse from(ResumeTemplate template) {
        return new ResumeTemplateDetailResponse(
                template.getId(),
                template.getName(),
                template.getCategory(),
                template.getRoleType(),
                template.getExperienceLevel(),
                template.getLayoutType(),
                template.getStyleType(),
                template.isAtsFriendly(),
                template.getTagsJson(),
                template.getPreviewImageUrl(),
                template.getTemplateKey(),
                template.getHtmlTemplatePath(),
                template.getCssTemplatePath(),
                template.getSupportedSectionsJson(),
                template.getHtmlTemplateContent(),
                template.isPremium()
        );
    }
}

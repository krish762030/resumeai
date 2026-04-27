package com.resumeai.template.dto;

import com.resumeai.template.ResumeTemplate;

public record ResumeTemplateResponse(
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
        boolean premium
) {
    public static ResumeTemplateResponse from(ResumeTemplate template) {
        return new ResumeTemplateResponse(
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
                template.isPremium()
        );
    }
}

package com.resumeai.template.dto;

import com.resumeai.template.ResumeTemplate;

public record ResumeTemplateDetailResponse(
        Long id,
        String name,
        String category,
        boolean atsFriendly,
        String previewImageUrl,
        String htmlTemplatePath,
        String htmlTemplateContent,
        boolean premium
) {
    public static ResumeTemplateDetailResponse from(ResumeTemplate template) {
        return new ResumeTemplateDetailResponse(
                template.getId(),
                template.getName(),
                template.getCategory(),
                template.isAtsFriendly(),
                template.getPreviewImageUrl(),
                template.getHtmlTemplatePath(),
                template.getHtmlTemplateContent(),
                template.isPremium()
        );
    }
}

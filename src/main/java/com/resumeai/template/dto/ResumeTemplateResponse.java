package com.resumeai.template.dto;

import com.resumeai.template.ResumeTemplate;

public record ResumeTemplateResponse(
        Long id,
        String name,
        String category,
        boolean atsFriendly,
        String previewImageUrl,
        String htmlTemplatePath,
        boolean premium
) {
    public static ResumeTemplateResponse from(ResumeTemplate template) {
        return new ResumeTemplateResponse(
                template.getId(),
                template.getName(),
                template.getCategory(),
                template.isAtsFriendly(),
                template.getPreviewImageUrl(),
                template.getHtmlTemplatePath(),
                template.isPremium()
        );
    }
}

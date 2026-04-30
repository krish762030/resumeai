package com.resumeai.resumebuilder.dto;

import com.resumeai.resumebuilder.SectionTemplate;

public record SectionTemplateResponse(
        Long id,
        String sectionType,
        String title,
        String description,
        String icon,
        boolean isDefault,
        boolean isPremium,
        int displayOrder,
        String defaultContentJson
) {
    public static SectionTemplateResponse from(SectionTemplate template) {
        return new SectionTemplateResponse(
                template.getId(),
                template.getSectionType(),
                template.getTitle(),
                template.getDescription(),
                template.getIcon(),
                template.isDefaultSection(),
                template.isPremium(),
                template.getDisplayOrder(),
                template.getDefaultContentJson()
        );
    }
}

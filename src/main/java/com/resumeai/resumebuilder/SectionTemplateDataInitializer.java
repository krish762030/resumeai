package com.resumeai.resumebuilder;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SectionTemplateDataInitializer implements CommandLineRunner {

    private final SectionTemplateRepository sectionTemplateRepository;

    @Override
    public void run(String... args) {
        Set<String> existingTypes = sectionTemplateRepository.findAll().stream()
                .map(SectionTemplate::getSectionType)
                .collect(java.util.stream.Collectors.toSet());

        List<SectionTemplate> defaults = List.of(
                template("SUMMARY", "Summary", "Short professional introduction", "summary", true, false, 1, "{\"text\":\"Java Full Stack Developer with strong ATS-focused storytelling.\"}"),
                template("EXPERIENCE", "Experience", "Role history with impact bullets", "briefcase", true, false, 2, "{\"items\":[{\"company\":\"Company Name\",\"role\":\"Role Title\",\"location\":\"City\",\"startDate\":\"2023\",\"endDate\":\"Present\",\"description\":[\"Describe your key impact here\"]}]}"),
                template("EDUCATION", "Education", "Degrees and academic history", "graduation-cap", true, false, 3, "{\"items\":[{\"degree\":\"Degree Name\",\"institute\":\"Institute Name\",\"startDate\":\"2019\",\"endDate\":\"2023\",\"location\":\"City\"}]}"),
                template("SKILLS", "Skills", "Grouped technical and soft skills", "sparkles", true, false, 4, "{\"groups\":[{\"title\":\"Backend\",\"skills\":[\"Java\",\"Spring Boot\"]}]}"),
                template("PROJECTS", "Projects", "Projects with stack and outcomes", "folder-kanban", false, false, 5, "{\"items\":[{\"title\":\"Project Name\",\"subtitle\":\"Tech Stack\",\"description\":[\"Describe the project outcome\"]}]}"),
                template("CERTIFICATIONS", "Certification Course", "Courses and certifications", "badge-check", false, false, 6, "{\"items\":[{\"title\":\"Certification Name\",\"issuer\":\"Platform\",\"year\":\"2024\"}]}"),
                template("LANGUAGES", "Languages", "Spoken languages and proficiency", "languages", false, false, 7, "{\"items\":[{\"name\":\"English\",\"level\":\"Professional\"}]}"),
                template("CUSTOM", "Custom Section", "Custom flexible section block", "plus-square", false, true, 8, "{\"items\":[{\"title\":\"Custom Heading\",\"description\":[\"Add custom content\"]}]}")
        );

        defaults.stream()
                .filter(item -> !existingTypes.contains(item.getSectionType()))
                .forEach(sectionTemplateRepository::save);
    }

    private SectionTemplate template(
            String sectionType,
            String title,
            String description,
            String icon,
            boolean defaultSection,
            boolean premium,
            int displayOrder,
            String defaultContentJson
    ) {
        return SectionTemplate.builder()
                .sectionType(sectionType)
                .title(title)
                .description(description)
                .icon(icon)
                .defaultSection(defaultSection)
                .premium(premium)
                .displayOrder(displayOrder)
                .defaultContentJson(defaultContentJson)
                .build();
    }
}

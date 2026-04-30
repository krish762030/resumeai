package com.resumeai.template;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ResumeTemplateDataInitializer implements CommandLineRunner {

    private final ResumeTemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        Set<String> existingNames = templateRepository.findAll().stream()
                .map(ResumeTemplate::getName)
                .collect(java.util.stream.Collectors.toSet());

        List<ResumeTemplate> defaults = List.of(
                template("ATS Graduate", "Fresher", "Software Developer", "Fresher", "Single Column", "Clean", true, true, "assets/templates/ats-graduate.svg", "ats-graduate", "styles/ats-graduate", sections("summary", "experience", "skills", "education", "projects"), tags("modern", "clean", "one-column")),
                template("ATS Internship", "Fresher", "Software Developer", "Fresher", "Single Column", "Minimal", false, true, "assets/templates/ats-internship.svg", "ats-internship", "styles/ats-internship", sections("summary", "experience", "skills", "education", "projects"), tags("internship", "ATS", "student")),
                template("Fresher Software Developer", "Developer", "Software Developer", "Fresher", "Single Column", "Modern", false, true, "assets/templates/fresher-software-developer.svg", "fresher-software-developer", "styles/fresher-software-developer", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("developer", "simple", "ATS")),
                template("Java Developer", "Developer", "Software Developer", "Mid Level", "Single Column", "Modern", true, true, "assets/templates/java-developer.svg", "java-developer", "styles/java-developer", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("java", "backend", "clean")),
                template("Backend Developer", "Developer", "Software Developer", "Mid Level", "Single Column", "Minimal", true, true, "assets/templates/backend-developer.svg", "backend-developer", "styles/backend-developer", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("api", "microservices", "ATS")),
                template("Full Stack Developer", "Developer", "Software Developer", "Mid Level", "Two Column", "Modern", true, true, "assets/templates/fullstack-developer.svg", "fullstack-developer", "styles/fullstack-developer", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("modern", "two-column", "full-stack")),
                template("Data Analyst", "Developer", "Data Analyst", "Mid Level", "Single Column", "Clean", true, true, "assets/templates/data-analyst.svg", "data-analyst", "styles/data-analyst", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("analytics", "sql", "dashboard")),
                template("MBA Fresher", "Professional", "MBA", "Fresher", "Single Column", "Clean", true, true, "assets/templates/mba-fresher.svg", "mba-fresher", "styles/mba-fresher", sections("summary", "experience", "skills", "education", "projects"), tags("mba", "business", "clean")),
                template("Professional One Page", "Professional", "MBA", "Mid Level", "Single Column", "Compact", false, true, "assets/templates/professional-one-page.svg", "professional-one-page", "styles/professional-one-page", sections("summary", "experience", "skills", "education", "projects"), tags("compact", "one-page", "executive")),
                template("Two Column Modern", "Modern", "Software Developer", "Mid Level", "Two Column", "Modern", true, true, "assets/templates/two-column-modern.svg", "two-column-modern", "styles/two-column-modern", sections("summary", "experience", "skills", "education", "projects", "certifications"), tags("two-column", "modern", "visual")),
                template("Compact Resume", "Compact", "Software Developer", "Mid Level", "Single Column", "Compact", true, true, "assets/templates/compact-resume.svg", "compact-resume", "styles/compact-resume", sections("summary", "experience", "skills", "education", "projects"), tags("compact", "one-page", "ATS")),
                template("Creative Clean", "Modern", "Designer", "Mid Level", "Two Column", "Creative", true, true, "assets/templates/creative-clean.svg", "creative-clean", "styles/creative-clean", sections("summary", "experience", "skills", "education", "projects"), tags("creative", "clean", "portfolio"))
        );

        defaults.stream()
                .filter(template -> !existingNames.contains(template.getName()))
                .forEach(templateRepository::save);
    }

    private ResumeTemplate template(
            String name,
            String category,
            String roleType,
            String experienceLevel,
            String layoutType,
            String styleType,
            boolean premium,
            boolean atsFriendly,
            String previewImageUrl,
            String templateKey,
            String cssTemplatePath,
            String supportedSectionsJson,
            String tagsJson
    ) {
        return ResumeTemplate.builder()
                .name(name)
                .category(category)
                .roleType(roleType)
                .experienceLevel(experienceLevel)
                .layoutType(layoutType)
                .styleType(styleType)
                .premium(premium)
                .atsFriendly(atsFriendly)
                .previewImageUrl(previewImageUrl)
                .templateKey(templateKey)
                .htmlTemplatePath("templates/" + templateKey)
                .cssTemplatePath(cssTemplatePath)
                .supportedSectionsJson(supportedSectionsJson)
                .tagsJson(tagsJson)
                .htmlTemplateContent(defaultTemplateHtml())
                .build();
    }

    private String sections(String... sections) {
        return "[" + java.util.Arrays.stream(sections).map(section -> "\"" + section + "\"").collect(java.util.stream.Collectors.joining(",")) + "]";
    }

    private String tags(String... tags) {
        return "[" + java.util.Arrays.stream(tags).map(tag -> "\"" + tag + "\"").collect(java.util.stream.Collectors.joining(",")) + "]";
    }

    private String defaultTemplateHtml() {
        return """
                <html>
                  <body style="margin:0;background:#f5f7ff;font-family:Arial,sans-serif;color:#111827">
                    <div style="max-width:900px;margin:24px auto;background:#ffffff;padding:40px;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden">
                      <div style="background:#284b8f;color:#ffffff;padding:28px 30px;margin:-40px -40px 28px -40px">
                        <h1 style="margin:0;font-size:32px;letter-spacing:0.02em">{{fullName}}</h1>
                        <p style="margin:8px 0 0 0;font-size:15px;color:#dbe8ff">{{headline}}</p>
                        <p style="margin:12px 0 0 0;font-size:13px;color:#eff4ff">{{email}} | {{phone}} | {{links}}</p>
                      </div>
                      {{educationSection}}
                      {{skillsSection}}
                      {{projectsSection}}
                      {{experienceSection}}
                      {{certificationsSection}}
                      {{achievementsSection}}
                      {{languagesSection}}
                      {{watermark}}
                    </div>
                  </body>
                </html>
                """;
    }
}

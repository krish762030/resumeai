package com.resumeai.template;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ResumeTemplateDataInitializer implements CommandLineRunner {

    private final ResumeTemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        if (templateRepository.count() > 0) {
            return;
        }

        templateRepository.saveAll(List.of(
                ResumeTemplate.builder()
                        .name("Fresher Software Developer")
                        .category("Software")
                        .atsFriendly(true)
                        .previewImageUrl("https://placehold.co/600x800/eef2ff/14121f?text=ATS+Developer")
                        .htmlTemplatePath("templates/fresher-software-developer")
                        .htmlTemplateContent(defaultTemplateHtml())
                        .premium(false)
                        .build(),
                ResumeTemplate.builder()
                        .name("Internship Resume")
                        .category("Internship")
                        .atsFriendly(true)
                        .previewImageUrl("https://placehold.co/600x800/f7f4ee/14121f?text=ATS+Internship")
                        .htmlTemplatePath("templates/internship-resume")
                        .htmlTemplateContent(defaultTemplateHtml())
                        .premium(false)
                        .build(),
                ResumeTemplate.builder()
                        .name("General Graduate Resume")
                        .category("Graduate")
                        .atsFriendly(true)
                        .previewImageUrl("https://placehold.co/600x800/ffffff/14121f?text=ATS+Graduate")
                        .htmlTemplatePath("templates/general-graduate-resume")
                        .htmlTemplateContent(defaultTemplateHtml())
                        .premium(true)
                        .build()
        ));
    }

    private String defaultTemplateHtml() {
        return """
                <html>
                  <body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
                    <div style="max-width:900px;margin:24px auto;background:#ffffff;padding:40px;border:1px solid #e5e7eb">
                      <div style="background:#59707c;color:#ffffff;padding:24px 28px;margin:-40px -40px 24px -40px">
                        <h1 style="margin:0;font-size:32px;letter-spacing:0.04em">{{fullName}}</h1>
                        <p style="margin:6px 0 0 0;font-size:15px;color:#f1f5f9">{{headline}}</p>
                        <p style="margin:12px 0 0 0;font-size:13px;color:#e2e8f0">{{email}} | {{phone}} | {{links}}</p>
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

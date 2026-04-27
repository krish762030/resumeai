package com.resumeai.resumebuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ResumeBuilderRenderer {

    private final ObjectMapper objectMapper;

    public ResumeBuilderRenderer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String render(String title, String resumeDataJson, boolean watermarkEnabled) {
        return render(title, resumeDataJson, watermarkEnabled, null);
    }

    public String render(String title, String resumeDataJson, boolean watermarkEnabled, String templateHtmlContent) {
        Map<String, Object> data = readJson(resumeDataJson);

        String personalName = stringValue(data.get("fullName"), "Candidate Name");
        String headline = stringValue(data.get("headline"), "ATS-friendly resume for recruiter screening");
        String email = stringValue(data.get("email"), "");
        String phone = stringValue(data.get("phone"), "");
        String links = stringValue(data.get("links"), "");

        List<String> education = listValue(data.get("education"));
        List<String> skills = listValue(data.get("skills"));
        List<String> projects = listValue(data.get("projects"));
        List<String> experience = listValue(data.get("experience"));
        List<String> certifications = listValue(data.get("certifications"));
        List<String> achievements = listValue(data.get("achievements"));
        List<String> languages = listValue(data.get("languages"));

        String watermark = watermarkEnabled
                ? "<div style='margin-top:24px;padding-top:16px;border-top:1px dashed #f15b3e;color:#f15b3e;font-weight:700'>Free preview only. Upgrade for final download and more edits.</div>"
                : "";

        if (templateHtmlContent != null && !templateHtmlContent.isBlank()) {
            return templateHtmlContent
                    .replace("{{fullName}}", escape(personalName))
                    .replace("{{headline}}", escape(headline))
                    .replace("{{email}}", escape(email))
                    .replace("{{phone}}", escape(phone))
                    .replace("{{links}}", escape(links))
                    .replace("{{educationSection}}", section("Education", education))
                    .replace("{{skillsSection}}", section("Skills", skills))
                    .replace("{{projectsSection}}", section("Projects", projects))
                    .replace("{{experienceSection}}", section("Experience / Internship", experience))
                    .replace("{{certificationsSection}}", section("Certifications", certifications))
                    .replace("{{achievementsSection}}", section("Achievements", achievements))
                    .replace("{{languagesSection}}", section("Languages", languages))
                    .replace("{{watermark}}", watermark)
                    .replace("{{title}}", escape(title));
        }

        return """
                <html>
                  <body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
                    <div style="max-width:900px;margin:24px auto;background:#ffffff;padding:40px;border:1px solid #e5e7eb">
                      <div style="border-bottom:2px solid #111827;padding-bottom:16px;margin-bottom:24px">
                        <h1 style="margin:0;font-size:34px">%s</h1>
                        <p style="margin:8px 0 0 0;font-size:16px;color:#374151">%s</p>
                        <p style="margin:12px 0 0 0;font-size:13px;color:#6b7280">%s | %s | %s</p>
                      </div>
                      %s
                      %s
                      %s
                      %s
                      %s
                      %s
                      %s
                      <div style="margin-top:24px;color:#6b7280;font-size:12px">Template: %s</div>
                      %s
                    </div>
                  </body>
                </html>
                """.formatted(
                escape(personalName),
                escape(headline),
                escape(email),
                escape(phone),
                escape(links),
                section("Education", education),
                section("Skills", skills),
                section("Projects", projects),
                section("Experience / Internship", experience),
                section("Certifications", certifications),
                section("Achievements", achievements),
                section("Languages", languages),
                escape(title),
                watermark
        );
    }

    private Map<String, Object> readJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid resume data JSON");
        }
    }

    private List<String> listValue(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(item -> {
                        if (item instanceof Map<?, ?> map && map.get("value") != null) {
                            return String.valueOf(map.get("value"));
                        }
                        return String.valueOf(item);
                    })
                    .map(String::trim)
                    .filter(item -> !item.isBlank())
                    .toList();
        }
        if (value == null) {
            return Collections.emptyList();
        }
        String asString = String.valueOf(value);
        if (asString.isBlank()) {
            return Collections.emptyList();
        }
        return List.of(asString);
    }

    private String stringValue(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? fallback : text;
    }

    private String section(String title, List<String> items) {
        if (items.isEmpty()) {
            return "";
        }
        String rows = items.stream()
                .map(item -> "<li style='margin:0 0 8px 0'>" + escape(item) + "</li>")
                .reduce("", String::concat);
        return """
                <section style="margin-top:20px">
                  <h2 style="margin:0 0 10px 0;font-size:16px;text-transform:uppercase;letter-spacing:0.08em">%s</h2>
                  <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7">%s</ul>
                </section>
                """.formatted(escape(title), rows);
    }

    private String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}

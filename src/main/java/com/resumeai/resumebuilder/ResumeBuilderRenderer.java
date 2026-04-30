package com.resumeai.resumebuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public String renderDynamic(
            String title,
            String themeJson,
            List<ResumeSection> sections,
            boolean watermarkEnabled,
            String templateHtmlContent
    ) {
        Map<String, Object> theme = readJson(themeJson);
        String headerColor = stringValue(theme.get("headerColor"), "#284b8f");
        String primaryColor = stringValue(theme.get("primaryColor"), "#1E3A5F");
        String fontFamily = stringValue(theme.get("fontFamily"), "Poppins, Arial, sans-serif");
        String sectionStyle = stringValue(theme.get("sectionStyle"), "underline");
        String layout = stringValue(theme.get("layout"), "single-column");
        String headerFontSize = numericValue(theme.get("headerFontSize"), 22);
        String bodyFontSize = numericValue(theme.get("bodyFontSize"), 12);

        String fullName = "Candidate Name";
        String headline = "Professional Headline";
        String email = "";
        String phone = "";
        String links = "";

        for (ResumeSection section : sections) {
            if (!section.isVisible()) {
                continue;
            }
            Map<String, Object> content = readJson(section.getContentJson());
            if ("SUMMARY".equalsIgnoreCase(section.getSectionType())) {
                fullName = stringValue(content.get("fullName"), fullName);
                headline = stringValue(content.get("headline"), stringValue(content.get("text"), headline));
                email = stringValue(content.get("email"), email);
                phone = stringValue(content.get("phone"), phone);
                links = stringValue(content.get("links"), links);
            }
        }

        String sectionsHtml = sections.stream()
                .filter(ResumeSection::isVisible)
                .sorted((left, right) -> Integer.compare(left.getSectionOrder(), right.getSectionOrder()))
                .map(section -> renderDynamicSection(
                        section.getSectionType(),
                        section.getSectionTitle(),
                        readJson(section.getContentJson()),
                        primaryColor,
                        sectionStyle
                ))
                .collect(Collectors.joining());

        String watermark = watermarkEnabled
                ? "<div style='margin-top:24px;padding-top:16px;border-top:1px dashed #ef4444;color:#ef4444;font-weight:700'>Free PDF includes watermark. Upgrade for premium templates, AI tools, and watermark-free export.</div>"
                : "";

        return """
                <html>
                  <body style="margin:0;background:#eef2ff;font-family:%s;color:#111827">
                    <div style="max-width:900px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden">
                      <div style="background:%s;color:#ffffff;padding:28px 32px">
                        <h1 style="margin:0;font-size:%spx">%s</h1>
                        <p style="margin:8px 0 0 0;font-size:15px;color:#dbeafe">%s</p>
                        <p style="margin:12px 0 0 0;font-size:13px;color:#e5efff">%s | %s | %s</p>
                      </div>
                      <div style="padding:30px 32px;font-size:%spx">
                        <div style="%s">%s</div>
                        <div style="margin-top:20px;color:#6b7280;font-size:12px">Template: %s</div>
                        %s
                      </div>
                    </div>
                  </body>
                </html>
                """.formatted(
                escape(fontFamily),
                escape(headerColor),
                escape(headerFontSize),
                escape(fullName),
                escape(headline),
                escape(email),
                escape(phone),
                escape(links),
                escape(bodyFontSize),
                "two-column".equalsIgnoreCase(layout) ? "column-count:2;column-gap:28px;" : "",
                sectionsHtml,
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

    private String numericValue(Object value, int fallback) {
        if (value instanceof Number number) {
            return String.valueOf(number.intValue());
        }
        if (value == null) {
            return String.valueOf(fallback);
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? String.valueOf(fallback) : text;
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

    private String renderDynamicSection(String sectionType, String sectionTitle, Map<String, Object> content, String accentColor, String sectionStyle) {
        String headingStyle = switch (sectionStyle.toLowerCase()) {
            case "pill" -> "display:inline-block;background:%s;color:white;padding:6px 14px;border-radius:999px;margin:0 0 12px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.08em".formatted(escape(accentColor));
            case "plain" -> "margin:0 0 12px 0;font-size:16px;color:%s;text-transform:uppercase;letter-spacing:0.08em".formatted(escape(accentColor));
            default -> "margin:0 0 12px 0;font-size:16px;color:%s;text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid %s;padding-bottom:6px".formatted(escape(accentColor), escape(accentColor));
        };

        String body = switch (sectionType.toUpperCase()) {
            case "SUMMARY" -> "<p style='margin:0;line-height:1.8;color:#374151'>" + escape(stringValue(content.get("text"), "")) + "</p>";
            case "EXPERIENCE" -> renderObjectItems(content.get("items"), List.of("company", "role", "location", "startDate", "endDate"), "description");
            case "EDUCATION" -> renderObjectItems(content.get("items"), List.of("degree", "institute", "location", "startDate", "endDate"), null);
            case "SKILLS" -> renderSkillGroups(content.get("groups"));
            case "PROJECTS" -> renderObjectItems(content.get("items"), List.of("title", "subtitle"), "description");
            case "CERTIFICATIONS" -> renderObjectItems(content.get("items"), List.of("title", "issuer", "year"), null);
            case "LANGUAGES" -> renderObjectItems(content.get("items"), List.of("name", "level"), null);
            default -> renderObjectItems(content.get("items"), List.of("title"), "description");
        };
        if (body.isBlank()) {
            return "";
        }
        return "<section style='break-inside:avoid;margin-bottom:20px'><h2 style=\"" + headingStyle + "\">" + escape(sectionTitle) + "</h2>" + body + "</section>";
    }

    private String renderSkillGroups(Object groupsValue) {
        if (!(groupsValue instanceof List<?> groups)) {
            return "";
        }
        return groups.stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(group -> {
                    String title = stringValue(group.get("title"), "");
                    List<String> skills = listValue(group.get("skills"));
                    if (skills.isEmpty()) {
                        return "";
                    }
                    return "<div style='margin-bottom:12px'><strong>" + escape(title) + ":</strong> " + escape(String.join(", ", skills)) + "</div>";
                })
                .collect(Collectors.joining());
    }

    private String renderObjectItems(Object itemsValue, List<String> primaryFields, String bulletField) {
        if (!(itemsValue instanceof List<?> items)) {
            return "";
        }
        return items.stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(item -> {
                    String header = primaryFields.stream()
                            .map(field -> stringValue(item.get(field), ""))
                            .filter(text -> !text.isBlank())
                            .collect(Collectors.joining(" | "));
                    String bullets = "";
                    if (bulletField != null && item.get(bulletField) != null) {
                        List<String> descriptions = listValue(item.get(bulletField));
                        if (!descriptions.isEmpty()) {
                            bullets = "<ul style='margin:8px 0 0 18px;padding:0;line-height:1.7'>" + descriptions.stream()
                                    .map(line -> "<li>" + escape(line) + "</li>")
                                    .collect(Collectors.joining()) + "</ul>";
                        }
                    }
                    return "<div style='margin-bottom:14px'><div style='font-weight:600;color:#111827'>" + escape(header) + "</div>" + bullets + "</div>";
                })
                .collect(Collectors.joining());
    }
}

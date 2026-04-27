package com.resumeai.template;

import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.template.dto.AdminResumeTemplateCreateRequest;
import com.resumeai.template.dto.ResumeTemplateDetailResponse;
import com.resumeai.template.dto.ResumeTemplateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ResumeTemplateService {

    private final ResumeTemplateRepository templateRepository;
    private final TemplateAssetStorageService templateAssetStorageService;

    public List<ResumeTemplateResponse> getTemplates(
            String search,
            String roleType,
            String experience,
            String layout,
            String style,
            Boolean isAtsFriendly,
            Boolean isPremium,
            String category
    ) {
        return templateRepository.findAll().stream()
                .filter(template -> matches(search, template.getName())
                        || matches(search, template.getCategory())
                        || matches(search, template.getRoleType())
                        || matches(search, template.getTagsJson()))
                .filter(template -> matchesExact(roleType, template.getRoleType()))
                .filter(template -> matchesExact(experience, template.getExperienceLevel()))
                .filter(template -> matchesExact(layout, template.getLayoutType()))
                .filter(template -> matchesExact(style, template.getStyleType()))
                .filter(template -> matchesExact(category, template.getCategory()))
                .filter(template -> isAtsFriendly == null || template.isAtsFriendly() == isAtsFriendly)
                .filter(template -> isPremium == null || template.isPremium() == isPremium)
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(ResumeTemplateResponse::from)
                .toList();
    }

    public ResumeTemplate getTemplate(Long templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
    }

    public ResumeTemplateDetailResponse getTemplateDetail(Long templateId) {
        return ResumeTemplateDetailResponse.from(getTemplate(templateId));
    }

    public ResumeTemplateDetailResponse createTemplate(
            AdminResumeTemplateCreateRequest request,
            MultipartFile previewImage,
            MultipartFile htmlTemplateFile
    ) {
        String previewImageUrl = templateAssetStorageService.storePreviewImage(previewImage);
        String htmlTemplateContent;
        String htmlTemplatePath;
        if (htmlTemplateFile != null && !htmlTemplateFile.isEmpty()) {
            htmlTemplatePath = htmlTemplateFile.getOriginalFilename();
            try {
                htmlTemplateContent = new String(htmlTemplateFile.getBytes());
            } catch (Exception exception) {
                throw new IllegalStateException("Failed to read uploaded HTML template", exception);
            }
        } else {
            htmlTemplatePath = "generated/default-layout";
            htmlTemplateContent = defaultEditableTemplate();
        }

        ResumeTemplate saved = templateRepository.save(ResumeTemplate.builder()
                .name(request.name().trim())
                .category(request.category().trim())
                .roleType(normalizedOrFallback(request.roleType(), normalizeRoleType(request.category())))
                .experienceLevel(normalizedOrFallback(request.experienceLevel(), "Fresher"))
                .layoutType(normalizedOrFallback(request.layoutType(), "Single Column"))
                .styleType(normalizedOrFallback(request.styleType(), "Modern"))
                .atsFriendly(Boolean.TRUE.equals(request.atsFriendly()))
                .tagsJson(normalizedOrFallback(request.tagsJson(), "[\"clean\",\"ATS\",\"simple\"]"))
                .previewImageUrl(previewImageUrl)
                .templateKey(normalizedOrFallback(request.templateKey(), slug(request.name())))
                .htmlTemplatePath(htmlTemplatePath)
                .cssTemplatePath(normalizedOrFallback(request.cssTemplatePath(), "styles/default"))
                .htmlTemplateContent(htmlTemplateContent)
                .supportedSectionsJson(normalizedOrFallback(request.supportedSectionsJson(), "[\"summary\",\"experience\",\"skills\",\"education\"]"))
                .premium(Boolean.TRUE.equals(request.premium()))
                .build());

        return ResumeTemplateDetailResponse.from(saved);
    }

    private String defaultEditableTemplate() {
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

    private String normalizeRoleType(String category) {
        String normalized = category == null ? "" : category.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "software", "developer" -> "developer";
            case "design", "designer" -> "designer";
            case "mba", "professional", "corporate" -> "mba";
            default -> "developer";
        };
    }

    private String slug(String value) {
        return value == null ? "template" : value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private String normalizedOrFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private boolean matches(String query, String value) {
        if (query == null || query.isBlank()) {
            return true;
        }
        return value != null && value.toLowerCase(Locale.ROOT).contains(query.trim().toLowerCase(Locale.ROOT));
    }

    private boolean matchesExact(String query, String value) {
        if (query == null || query.isBlank()) {
            return true;
        }
        return value != null && normalize(value).equals(normalize(query));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace("-", "").replace(" ", "");
    }
}

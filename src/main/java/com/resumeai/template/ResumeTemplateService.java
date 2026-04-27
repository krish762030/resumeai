package com.resumeai.template;

import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.template.dto.AdminResumeTemplateCreateRequest;
import com.resumeai.template.dto.ResumeTemplateDetailResponse;
import com.resumeai.template.dto.ResumeTemplateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeTemplateService {

    private final ResumeTemplateRepository templateRepository;
    private final TemplateAssetStorageService templateAssetStorageService;

    public List<ResumeTemplateResponse> getTemplates() {
        return templateRepository.findAll().stream()
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
                .atsFriendly(Boolean.TRUE.equals(request.atsFriendly()))
                .previewImageUrl(previewImageUrl)
                .htmlTemplatePath(htmlTemplatePath)
                .htmlTemplateContent(htmlTemplateContent)
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
}

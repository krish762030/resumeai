package com.resumeai.template;

import com.resumeai.template.dto.AdminResumeTemplateCreateRequest;
import com.resumeai.template.dto.ResumeTemplateDetailResponse;
import com.resumeai.template.dto.ResumeTemplateResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class ResumeTemplateController {

    private final ResumeTemplateService resumeTemplateService;

    @GetMapping
    public List<ResumeTemplateResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roleType,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String layout,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) Boolean isAtsFriendly,
            @RequestParam(required = false) Boolean isPremium,
            @RequestParam(required = false) String category
    ) {
        return resumeTemplateService.getTemplates(search, roleType, experience, layout, style, isAtsFriendly, isPremium, category);
    }

    @GetMapping("/{templateId}")
    public ResumeTemplateDetailResponse detail(@PathVariable Long templateId) {
        return resumeTemplateService.getTemplateDetail(templateId);
    }

    @PostMapping(value = "/admin/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResumeTemplateDetailResponse upload(
            @RequestPart("name") @NotBlank String name,
            @RequestPart("category") @NotBlank String category,
            @RequestPart(value = "roleType", required = false) String roleType,
            @RequestPart(value = "experienceLevel", required = false) String experienceLevel,
            @RequestPart(value = "layoutType", required = false) String layoutType,
            @RequestPart(value = "styleType", required = false) String styleType,
            @RequestPart("atsFriendly") Boolean atsFriendly,
            @RequestPart("premium") Boolean premium,
            @RequestPart(value = "templateKey", required = false) String templateKey,
            @RequestPart(value = "cssTemplatePath", required = false) String cssTemplatePath,
            @RequestPart(value = "supportedSectionsJson", required = false) String supportedSectionsJson,
            @RequestPart(value = "tagsJson", required = false) String tagsJson,
            @RequestPart("previewImage") MultipartFile previewImage,
            @RequestPart(value = "htmlTemplateFile", required = false) MultipartFile htmlTemplateFile
    ) {
        return resumeTemplateService.createTemplate(
                new AdminResumeTemplateCreateRequest(
                        name,
                        category,
                        roleType,
                        experienceLevel,
                        layoutType,
                        styleType,
                        atsFriendly,
                        premium,
                        templateKey,
                        cssTemplatePath,
                        supportedSectionsJson,
                        tagsJson
                ),
                previewImage,
                htmlTemplateFile
        );
    }
}

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
    public List<ResumeTemplateResponse> list() {
        return resumeTemplateService.getTemplates();
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
            @RequestPart("atsFriendly") Boolean atsFriendly,
            @RequestPart("premium") Boolean premium,
            @RequestPart("previewImage") MultipartFile previewImage,
            @RequestPart(value = "htmlTemplateFile", required = false) MultipartFile htmlTemplateFile
    ) {
        return resumeTemplateService.createTemplate(
                new AdminResumeTemplateCreateRequest(name, category, atsFriendly, premium),
                previewImage,
                htmlTemplateFile
        );
    }
}

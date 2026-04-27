package com.resumeai.resumebuilder;

import com.resumeai.resumebuilder.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ResumeEditorController {

    private final ResumeEditorService resumeEditorService;

    @GetMapping("/api/resume-builder/editor/resumes")
    public List<ResumeEditorResponse> getMyResumes() {
        return resumeEditorService.getMyResumes();
    }

    @PostMapping("/api/resume-builder/editor/resumes")
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeEditorResponse createResume(@Valid @RequestBody ResumeEditorCreateRequest request) {
        return resumeEditorService.createResume(request);
    }

    @GetMapping("/api/resume-builder/editor/resumes/{resumeId}")
    public ResumeEditorResponse getResume(@PathVariable Long resumeId) {
        return resumeEditorService.getResume(resumeId);
    }

    @PutMapping("/api/resume-builder/editor/resumes/{resumeId}")
    public ResumeEditorResponse updateResume(@PathVariable Long resumeId, @Valid @RequestBody ResumeEditorUpdateRequest request) {
        return resumeEditorService.updateResume(resumeId, request);
    }

    @PutMapping("/api/resumes/{resumeId}/template")
    public ResumeEditorResponse switchTemplate(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeTemplateSwitchRequest request
    ) {
        return resumeEditorService.switchTemplate(resumeId, request);
    }

    @DeleteMapping("/api/resume-builder/editor/resumes/{resumeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResume(@PathVariable Long resumeId) {
        resumeEditorService.deleteResume(resumeId);
    }

    @GetMapping("/api/resume-builder/editor/resumes/{resumeId}/sections")
    public List<ResumeSectionResponse> getSections(@PathVariable Long resumeId) {
        return resumeEditorService.getSections(resumeId);
    }

    @PostMapping("/api/resume-builder/editor/resumes/{resumeId}/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeEditorResponse addSection(@PathVariable Long resumeId, @Valid @RequestBody ResumeSectionRequest request) {
        return resumeEditorService.addSection(resumeId, request);
    }

    @PutMapping("/api/resume-builder/editor/resumes/{resumeId}/sections/{sectionId}")
    public ResumeEditorResponse updateSection(
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeSectionRequest request
    ) {
        return resumeEditorService.updateSection(resumeId, sectionId, request);
    }

    @DeleteMapping("/api/resume-builder/editor/resumes/{resumeId}/sections/{sectionId}")
    public ResumeEditorResponse deleteSection(@PathVariable Long resumeId, @PathVariable Long sectionId) {
        return resumeEditorService.deleteSection(resumeId, sectionId);
    }

    @PatchMapping("/api/resume-builder/editor/resumes/{resumeId}/sections/reorder")
    public ResumeEditorResponse reorderSections(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeSectionReorderRequest request
    ) {
        return resumeEditorService.reorderSections(resumeId, request);
    }

    @PatchMapping("/api/resume-builder/editor/resumes/{resumeId}/sections/{sectionId}/visibility")
    public ResumeEditorResponse updateSectionVisibility(
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeSectionVisibilityRequest request
    ) {
        return resumeEditorService.updateSectionVisibility(resumeId, sectionId, request);
    }

    @GetMapping("/api/resume-builder/editor/resumes/{resumeId}/theme")
    public Map<String, String> getTheme(@PathVariable Long resumeId) {
        return Map.of("themeJson", resumeEditorService.getTheme(resumeId));
    }

    @PutMapping("/api/resume-builder/editor/resumes/{resumeId}/theme")
    public ResumeEditorResponse updateTheme(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeThemeUpdateRequest request
    ) {
        return resumeEditorService.updateTheme(resumeId, request);
    }

    @GetMapping("/api/section-templates")
    public List<SectionTemplateResponse> getSectionTemplates() {
        return resumeEditorService.getSectionTemplates();
    }

    @PostMapping("/api/resume-builder/editor/resumes/{resumeId}/preview")
    public ResumeEditorResponse preview(@PathVariable Long resumeId) {
        return resumeEditorService.preview(resumeId);
    }
}

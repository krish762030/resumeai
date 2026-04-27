package com.resumeai.resumebuilder;

import com.resumeai.resumebuilder.dto.ResumeBuilderRequest;
import com.resumeai.resumebuilder.dto.ResumeBuilderResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resume-builder")
@RequiredArgsConstructor
public class ResumeBuilderController {

    private final ResumeBuilderService resumeBuilderService;

    @GetMapping("/resumes")
    public List<ResumeBuilderResponse> getMyResumes() {
        return resumeBuilderService.getMyResumes();
    }

    @GetMapping("/resumes/{resumeId}")
    public ResumeBuilderResponse getResume(@PathVariable Long resumeId) {
        return resumeBuilderService.getResume(resumeId);
    }

    @PostMapping("/resumes")
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeBuilderResponse createResume(@Valid @RequestBody ResumeBuilderRequest request) {
        return resumeBuilderService.createResume(request);
    }

    @PutMapping("/resumes/{resumeId}")
    public ResumeBuilderResponse updateResume(@PathVariable Long resumeId, @Valid @RequestBody ResumeBuilderRequest request) {
        return resumeBuilderService.updateResume(resumeId, request);
    }
}

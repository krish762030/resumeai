package com.resumeai.resume;

import com.resumeai.ai.AiAnalysisService;
import com.resumeai.ai.dto.ResumeAnalysisResponse;
import com.resumeai.job.JobService;
import com.resumeai.job.dto.JobMatchResponse;
import com.resumeai.resume.dto.ResumeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final AiAnalysisService aiAnalysisService;
    private final JobService jobService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeResponse upload(@RequestPart("file") MultipartFile file) {
        return resumeService.upload(file);
    }

    @GetMapping
    public List<ResumeResponse> getResumes() {
        return resumeService.getResumes();
    }

    @GetMapping("/{resumeId}")
    public ResumeResponse getResume(@PathVariable Long resumeId) {
        return resumeService.getResume(resumeId);
    }

    @GetMapping("/{resumeId}/analysis")
    public ResumeAnalysisResponse getAnalysis(@PathVariable Long resumeId) {
        return aiAnalysisService.getAnalysis(resumeId);
    }

    @PostMapping("/{resumeId}/analyze")
    public ResumeAnalysisResponse analyze(@PathVariable Long resumeId) {
        return aiAnalysisService.analyze(resumeId);
    }

    @PostMapping("/{resumeId}/improve")
    public ResumeAnalysisResponse improve(@PathVariable Long resumeId) {
        return aiAnalysisService.improve(resumeId);
    }

    @GetMapping("/{resumeId}/matches")
    public List<JobMatchResponse> matches(@PathVariable Long resumeId) {
        return jobService.generateMatches(resumeId);
    }
}

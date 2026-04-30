package com.resumeai.ai;

import com.resumeai.ai.dto.AiAnalysisResult;
import com.resumeai.ai.dto.ResumeAnalysisResponse;
import com.resumeai.common.util.TextListMapper;
import com.resumeai.resume.Resume;
import com.resumeai.resume.ResumeRepository;
import com.resumeai.resume.ResumeService;
import com.resumeai.resume.ResumeStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final ResumeService resumeService;
    private final ResumeAnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;
    private final AiResumeAnalyzer aiResumeAnalyzer;

    @Transactional
    public ResumeAnalysisResponse analyze(Long resumeId) {
        Resume resume = resumeService.getOwnedResume(resumeId);
        AiAnalysisResult result = aiResumeAnalyzer.analyze(resume);

        ResumeAnalysis analysis = analysisRepository.findByResume(resume)
                .orElse(ResumeAnalysis.builder().resume(resume).build());

        analysis.setAtsScore(result.atsScore());
        analysis.setSummaryFeedback(result.summaryFeedback());
        analysis.setStrengths(TextListMapper.toStorage(result.strengths()));
        analysis.setWeaknesses(TextListMapper.toStorage(result.weaknesses()));
        analysis.setMissingKeywords(TextListMapper.toStorage(result.missingKeywords()));
        analysis.setExtractedSkills(TextListMapper.toStorage(result.extractedSkills()));
        analysis.setImprovedSummary(result.improvedSummary());
        analysis.setImprovedExperience(TextListMapper.toStorage(result.improvedExperienceBullets()));

        ResumeAnalysis saved = analysisRepository.save(analysis);
        resume.setStatus(ResumeStatus.ANALYZED);
        resumeRepository.save(resume);

        return ResumeAnalysisResponse.from(saved);
    }

    public ResumeAnalysisResponse getAnalysis(Long resumeId) {
        Resume resume = resumeService.getOwnedResume(resumeId);
        ResumeAnalysis analysis = analysisRepository.findByResume(resume)
                .orElseThrow(() -> new com.resumeai.common.exception.ResourceNotFoundException(
                        "Analysis not found for resume: " + resumeId));
        return ResumeAnalysisResponse.from(analysis);
    }

    public ResumeAnalysisResponse improve(Long resumeId) {
        return analyze(resumeId);
    }
}

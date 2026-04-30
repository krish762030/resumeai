package com.resumeai.ai.dto;

import com.resumeai.ai.ResumeAnalysis;
import com.resumeai.common.util.TextListMapper;

import java.time.Instant;
import java.util.List;

public record ResumeAnalysisResponse(
        Long id,
        Long resumeId,
        Integer atsScore,
        String summaryFeedback,
        List<String> strengths,
        List<String> weaknesses,
        List<String> missingKeywords,
        List<String> extractedSkills,
        String improvedSummary,
        List<String> improvedExperienceBullets,
        Instant createdAt
) {
    public static ResumeAnalysisResponse from(ResumeAnalysis analysis) {
        return new ResumeAnalysisResponse(
                analysis.getId(),
                analysis.getResume().getId(),
                analysis.getAtsScore(),
                analysis.getSummaryFeedback(),
                TextListMapper.fromStorage(analysis.getStrengths()),
                TextListMapper.fromStorage(analysis.getWeaknesses()),
                TextListMapper.fromStorage(analysis.getMissingKeywords()),
                TextListMapper.fromStorage(analysis.getExtractedSkills()),
                analysis.getImprovedSummary(),
                TextListMapper.fromStorage(analysis.getImprovedExperience()),
                analysis.getCreatedAt()
        );
    }
}

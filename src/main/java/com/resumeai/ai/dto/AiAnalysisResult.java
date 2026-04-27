package com.resumeai.ai.dto;

import java.util.List;

public record AiAnalysisResult(
        int atsScore,
        String summaryFeedback,
        List<String> strengths,
        List<String> weaknesses,
        List<String> missingKeywords,
        List<String> extractedSkills,
        String improvedSummary,
        List<String> improvedExperienceBullets
) {
}

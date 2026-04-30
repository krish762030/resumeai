package com.resumeai.ai;

import com.resumeai.ai.dto.AiAnalysisResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class MockAiResumeAnalyzer implements AiResumeAnalyzer {

    private static final List<String> TARGET_KEYWORDS = List.of(
            "java", "spring boot", "mysql", "angular", "rest api", "docker",
            "hibernate", "git", "microservices", "aws", "javascript", "typescript"
    );

    @Override
    public AiAnalysisResult analyze(com.resumeai.resume.Resume resume) {
        String text = resume.getExtractedText() == null ? "" : resume.getExtractedText();
        String normalized = text.toLowerCase(Locale.ROOT);

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        Set<String> extractedSkills = new LinkedHashSet<>();

        if (normalized.contains("project")) {
            strengths.add("Includes project experience, which helps fresher profiles feel practical.");
        } else {
            weaknesses.add("Project section is missing or not clearly labelled.");
        }

        if (normalized.contains("intern")) {
            strengths.add("Internship exposure adds applied work context.");
        }

        if (normalized.contains("education")) {
            strengths.add("Education details are present.");
        } else {
            weaknesses.add("Education section should be explicit for fresher resumes.");
        }

        for (String keyword : TARGET_KEYWORDS) {
            if (normalized.contains(keyword)) {
                extractedSkills.add(titleCase(keyword));
            } else {
                missingKeywords.add(titleCase(keyword));
            }
        }

        if (text.length() < 400) {
            weaknesses.add("Resume is short on measurable detail and impact statements.");
        } else {
            strengths.add("Resume has enough content for keyword and section analysis.");
        }

        if (!normalized.matches("(?s).*\\d+.*")) {
            weaknesses.add("Bullet points lack metrics or quantified outcomes.");
        }

        int atsScore = 45;
        atsScore += Math.min(extractedSkills.size() * 4, 32);
        atsScore += strengths.size() * 3;
        atsScore -= weaknesses.size() * 2;
        atsScore = Math.max(35, Math.min(atsScore, 96));

        String summaryFeedback = """
                Focus the resume on a target role, add measurable impact in bullets, and make core technical skills easier to scan.
                The MVP analyzer favors clear section headings, relevant keywords, and project descriptions tied to outcomes.
                """.trim();

        String improvedSummary = """
                Entry-level software engineer with hands-on experience building web applications using Java, Spring Boot, MySQL, and Angular.
                Strong foundation in REST APIs, backend development, and problem solving, with a focus on delivering clean, maintainable features.
                """.trim();

        List<String> improvedBullets = List.of(
                "Built and deployed a full-stack application using Java, Spring Boot, MySQL, and Angular to streamline a core user workflow.",
                "Designed REST APIs, integrated database persistence, and improved feature delivery with modular backend code.",
                "Collaborated on debugging, testing, and refining application quality through structured problem solving."
        );

        return new AiAnalysisResult(
                atsScore,
                summaryFeedback,
                strengths,
                weaknesses,
                missingKeywords.stream().limit(6).toList(),
                new ArrayList<>(extractedSkills),
                improvedSummary,
                improvedBullets
        );
    }

    private String titleCase(String keyword) {
        return Arrays.stream(keyword.split(" "))
                .map(part -> part.isBlank() ? part : Character.toUpperCase(part.charAt(0)) + part.substring(1))
                .reduce((left, right) -> left + " " + right)
                .orElse(keyword);
    }
}

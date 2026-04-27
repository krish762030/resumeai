package com.resumeai.job;

import com.resumeai.ai.ResumeAnalysis;
import com.resumeai.ai.ResumeAnalysisRepository;
import com.resumeai.common.util.TextListMapper;
import com.resumeai.resume.Resume;
import com.resumeai.resume.ResumeStatus;
import com.resumeai.user.User;
import com.resumeai.user.UserRepository;
import com.resumeai.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class JobServiceTest {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobMatchRepository jobMatchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.resumeai.resume.ResumeRepository resumeRepository;

    @Autowired
    private ResumeAnalysisRepository analysisRepository;

    @Test
    @WithMockUser(username = "test@example.com")
    void calculatesMatchScoreFromExtractedSkills() {
        User user = userRepository.save(User.builder()
                .name("Test User")
                .email("test@example.com")
                .passwordHash("secret")
                .role(UserRole.USER)
                .build());

        Resume resume = resumeRepository.save(Resume.builder()
                .user(user)
                .fileName("resume.pdf")
                .fileUrl("resume.pdf")
                .extractedText("Java Spring Boot Angular MySQL")
                .status(ResumeStatus.ANALYZED)
                .build());

        analysisRepository.save(ResumeAnalysis.builder()
                .resume(resume)
                .atsScore(80)
                .summaryFeedback("Good")
                .missingKeywords("")
                .improvedSummary("Improved")
                .improvedExperience("")
                .strengths("Projects")
                .weaknesses("")
                .extractedSkills(TextListMapper.toStorage(List.of("Java", "Spring Boot", "Angular")))
                .build());

        jobMatchRepository.deleteAll();
        jobRepository.deleteAll();
        jobRepository.save(Job.builder()
                .title("Backend Developer")
                .company("Example")
                .location("Remote")
                .experienceLevel("Fresher")
                .requiredSkills(TextListMapper.toStorage(List.of("Java", "Spring Boot", "Docker", "REST API")))
                .jobUrl("https://example.com")
                .build());

        List<com.resumeai.job.dto.JobMatchResponse> matches = jobService.generateMatches(resume.getId());

        assertThat(matches).hasSize(1);
        assertThat(matches.get(0).matchScore()).isEqualTo(50);
        assertThat(matches.get(0).matchedSkills()).containsExactly("Java", "Spring Boot");
    }
}

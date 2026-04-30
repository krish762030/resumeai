package com.resumeai.job;

import com.resumeai.ai.ResumeAnalysis;
import com.resumeai.ai.ResumeAnalysisRepository;
import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.common.util.TextListMapper;
import com.resumeai.job.dto.JobMatchResponse;
import com.resumeai.job.dto.JobResponse;
import com.resumeai.resume.Resume;
import com.resumeai.resume.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobMatchRepository jobMatchRepository;
    private final ResumeService resumeService;
    private final ResumeAnalysisRepository analysisRepository;

    public List<JobResponse> getJobs() {
        return jobRepository.findAll()
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    @Transactional
    public List<JobMatchResponse> generateMatches(Long resumeId) {
        Resume resume = resumeService.getOwnedResume(resumeId);
        ResumeAnalysis analysis = analysisRepository.findByResume(resume)
                .orElseThrow(() -> new ResourceNotFoundException("Run analysis before requesting job matches"));

        Set<String> resumeSkills = TextListMapper.fromStorage(analysis.getExtractedSkills())
                .stream()
                .map(skill -> skill.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        jobMatchRepository.deleteByResume(resume);

        List<JobMatch> matches = new ArrayList<>();
        for (Job job : jobRepository.findAll()) {
            List<String> requiredSkills = TextListMapper.fromStorage(job.getRequiredSkills());
            List<String> matched = requiredSkills.stream()
                    .filter(skill -> resumeSkills.contains(skill.toLowerCase(Locale.ROOT)))
                    .toList();
            List<String> missing = requiredSkills.stream()
                    .filter(skill -> !resumeSkills.contains(skill.toLowerCase(Locale.ROOT)))
                    .toList();

            int score = requiredSkills.isEmpty() ? 0 : (matched.size() * 100) / requiredSkills.size();
            matches.add(JobMatch.builder()
                    .resume(resume)
                    .job(job)
                    .matchScore(score)
                    .matchedSkills(TextListMapper.toStorage(matched))
                    .missingSkills(TextListMapper.toStorage(missing))
                    .build());
        }

        return jobMatchRepository.saveAll(matches)
                .stream()
                .sorted((left, right) -> right.getMatchScore().compareTo(left.getMatchScore()))
                .map(JobMatchResponse::from)
                .toList();
    }
}

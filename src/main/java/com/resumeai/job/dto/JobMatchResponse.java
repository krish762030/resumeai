package com.resumeai.job.dto;

import com.resumeai.common.util.TextListMapper;
import com.resumeai.job.JobMatch;

import java.time.Instant;
import java.util.List;

public record JobMatchResponse(
        Long id,
        Long jobId,
        String title,
        String company,
        Integer matchScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        String jobUrl,
        Instant createdAt
) {
    public static JobMatchResponse from(JobMatch match) {
        return new JobMatchResponse(
                match.getId(),
                match.getJob().getId(),
                match.getJob().getTitle(),
                match.getJob().getCompany(),
                match.getMatchScore(),
                TextListMapper.fromStorage(match.getMatchedSkills()),
                TextListMapper.fromStorage(match.getMissingSkills()),
                match.getJob().getJobUrl(),
                match.getCreatedAt()
        );
    }
}

package com.resumeai.job.dto;

import com.resumeai.common.util.TextListMapper;
import com.resumeai.job.Job;

import java.util.List;

public record JobResponse(
        Long id,
        String title,
        String company,
        String location,
        String experienceLevel,
        List<String> requiredSkills,
        String jobUrl
) {
    public static JobResponse from(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getExperienceLevel(),
                TextListMapper.fromStorage(job.getRequiredSkills()),
                job.getJobUrl()
        );
    }
}

package com.resumeai.resume.dto;

import com.resumeai.resume.Resume;

import java.time.Instant;

public record ResumeResponse(
        Long id,
        String fileName,
        String fileUrl,
        String extractedText,
        String status,
        Instant createdAt
) {
    public static ResumeResponse from(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileUrl(),
                resume.getExtractedText(),
                resume.getStatus().name(),
                resume.getCreatedAt()
        );
    }
}

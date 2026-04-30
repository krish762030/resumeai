package com.resumeai.ai;

import com.resumeai.ai.dto.AiAnalysisResult;
import com.resumeai.resume.Resume;

public interface AiResumeAnalyzer {

    AiAnalysisResult analyze(Resume resume);
}

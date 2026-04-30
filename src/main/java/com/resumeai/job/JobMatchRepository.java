package com.resumeai.job;

import com.resumeai.resume.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {

    List<JobMatch> findByResumeOrderByMatchScoreDesc(Resume resume);

    void deleteByResume(Resume resume);
}

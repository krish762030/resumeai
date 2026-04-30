package com.resumeai.resumebuilder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeSectionRepository extends JpaRepository<ResumeSection, Long> {

    List<ResumeSection> findByResumeOrderBySectionOrderAsc(UserGeneratedResume resume);

    Optional<ResumeSection> findByIdAndResume(Long id, UserGeneratedResume resume);

    void deleteByResume(UserGeneratedResume resume);
}

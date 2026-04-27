package com.resumeai.template;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeTemplateRepository extends JpaRepository<ResumeTemplate, Long> {
    java.util.Optional<ResumeTemplate> findByNameIgnoreCase(String name);
}

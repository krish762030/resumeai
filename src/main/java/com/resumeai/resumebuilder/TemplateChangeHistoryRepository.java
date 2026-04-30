package com.resumeai.resumebuilder;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateChangeHistoryRepository extends JpaRepository<TemplateChangeHistory, Long> {
}

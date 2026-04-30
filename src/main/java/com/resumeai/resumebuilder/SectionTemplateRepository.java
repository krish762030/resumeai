package com.resumeai.resumebuilder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SectionTemplateRepository extends JpaRepository<SectionTemplate, Long> {

    List<SectionTemplate> findAllByOrderByDisplayOrderAsc();

    Optional<SectionTemplate> findBySectionType(String sectionType);
}

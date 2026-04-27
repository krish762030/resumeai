package com.resumeai.resumebuilder;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "section_templates")
public class SectionTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_type", nullable = false, unique = true)
    private String sectionType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String icon;

    @Column(name = "is_default", nullable = false)
    private boolean defaultSection;

    @Column(name = "is_premium", nullable = false)
    private boolean premium;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Lob
    @Column(name = "default_content_json", nullable = false, columnDefinition = "LONGTEXT")
    private String defaultContentJson;
}

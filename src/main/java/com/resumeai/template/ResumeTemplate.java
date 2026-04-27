package com.resumeai.template;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resume_templates")
public class ResumeTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "role_type", nullable = false)
    private String roleType;

    @Column(name = "experience_level", nullable = false)
    private String experienceLevel;

    @Column(name = "layout_type", nullable = false)
    private String layoutType;

    @Column(name = "style_type", nullable = false)
    private String styleType;

    @Column(name = "is_ats_friendly", nullable = false)
    private boolean atsFriendly;

    @Lob
    @Column(name = "tags_json", nullable = false, columnDefinition = "LONGTEXT")
    private String tagsJson;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(name = "template_key", nullable = false)
    private String templateKey;

    @Column(name = "html_template_path")
    private String htmlTemplatePath;

    @Column(name = "css_template_path")
    private String cssTemplatePath;

    @Lob
    @Column(name = "html_template_content", columnDefinition = "LONGTEXT")
    private String htmlTemplateContent;

    @Lob
    @Column(name = "supported_sections_json", nullable = false, columnDefinition = "LONGTEXT")
    private String supportedSectionsJson;

    @Column(name = "is_premium", nullable = false)
    private boolean premium;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

}

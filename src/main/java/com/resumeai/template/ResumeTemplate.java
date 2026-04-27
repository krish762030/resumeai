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

    @Column(name = "is_ats_friendly", nullable = false)
    private boolean atsFriendly;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(name = "html_template_path")
    private String htmlTemplatePath;

    @Lob
    @Column(name = "html_template_content", columnDefinition = "LONGTEXT")
    private String htmlTemplateContent;

    @Column(name = "is_premium", nullable = false)
    private boolean premium;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

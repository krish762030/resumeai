package com.resumeai.resumebuilder;

import com.resumeai.template.ResumeTemplate;
import com.resumeai.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_resumes")
public class UserGeneratedResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private ResumeTemplate template;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(name = "resume_data_json", nullable = false, columnDefinition = "LONGTEXT")
    private String resumeDataJson;

    @Lob
    @Column(name = "generated_html", nullable = false, columnDefinition = "LONGTEXT")
    private String generatedHtml;

    @Column(name = "generated_pdf_url")
    private String generatedPdfUrl;

    @Column(name = "edit_count", nullable = false)
    private Integer editCount;

    @Column(name = "download_count", nullable = false)
    private Integer downloadCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

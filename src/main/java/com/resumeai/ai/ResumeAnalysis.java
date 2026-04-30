package com.resumeai.ai;

import com.resumeai.resume.Resume;
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
@Table(name = "resume_analysis")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false, unique = true)
    private Resume resume;

    @Column(name = "ats_score", nullable = false)
    private Integer atsScore;

    @Lob
    @Column(name = "summary_feedback", columnDefinition = "TEXT")
    private String summaryFeedback;

    @Lob
    @Column(name = "missing_keywords", columnDefinition = "TEXT")
    private String missingKeywords;

    @Lob
    @Column(name = "improved_summary", columnDefinition = "TEXT")
    private String improvedSummary;

    @Lob
    @Column(name = "improved_experience", columnDefinition = "LONGTEXT")
    private String improvedExperience;

    @Lob
    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Lob
    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Lob
    @Column(name = "extracted_skills", columnDefinition = "TEXT")
    private String extractedSkills;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

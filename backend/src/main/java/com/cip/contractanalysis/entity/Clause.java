package com.cip.contractanalysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "clauses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false)
    private String clauseType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String extractedText;

    @Enumerated(EnumType.STRING)
    private Document.RiskLevel riskLevel;

    private Integer riskScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private Double templateSimilarityScore;

    private boolean deviationFlagged;

    private boolean oneSided;

    @Column(columnDefinition = "TEXT")
    private String oneSidedExplanation;

    private boolean unusual;

    @Column(columnDefinition = "TEXT")
    private String unusualExplanation;

    @Column(columnDefinition = "TEXT")
    private String expectedStandardLanguage;

    private boolean reviewed;

    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

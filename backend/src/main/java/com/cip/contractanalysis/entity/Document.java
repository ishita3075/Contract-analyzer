package com.cip.contractanalysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String contentType;

    private Long fileSizeBytes;

    private String fileStorageKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.UPLOADED;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private Integer overallRiskScore;

    @Enumerated(EnumType.STRING)
    private RiskLevel overallRiskLevel;

    private Boolean isContract;
    private String contractType;
    private String validationMessage;

    private LocalDateTime analyzedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Clause> clauses;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MissingClause> missingClauses;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean deleted;

    public enum AnalysisStatus {
        UPLOADED, PARSING, ANALYZING, ANALYZED, FAILED, INVALID_DOCUMENT
    }

    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }
}

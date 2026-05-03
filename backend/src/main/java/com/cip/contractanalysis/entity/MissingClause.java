package com.cip.contractanalysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "missing_clauses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingClause {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false)
    private String clauseType;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Severity {
        CRITICAL, IMPORTANT, RECOMMENDED
    }
}

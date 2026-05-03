package com.cip.contractanalysis.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class DocumentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentSummary {
        private String id;
        private String filename;
        private String contentType;
        private Long fileSizeBytes;
        private String status;
        private Integer overallRiskScore;
        private String overallRiskLevel;
        private Integer clauseCount;
        private Integer missingClauseCount;
        private Integer oneSidedClauseCount;
        private Integer unusualTermCount;
        private LocalDateTime createdAt;
        private LocalDateTime analyzedAt;
        private String uploadedBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentAnalysis {
        private String documentId;
        private String filename;
        private Integer overallRiskScore;
        private String overallRiskLevel;
        private Integer clauseCount;
        private Integer missingClauseCount;
        private Integer oneSidedClauseCount;
        private Integer unusualTermCount;
        private String oneSidedClausesSummary;
        private String unusualTermsSummary;
        private List<ClauseDto.ClauseDetail> clauses;
        private List<MissingClauseDto> missingClauses;
        private LocalDateTime analyzedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadResponse {
        private String documentId;
        private String filename;
        private String status;
        private String message;
    }
}

package com.cip.contractanalysis.dto;

import lombok.*;

public class ClauseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClauseDetail {
        private String clauseId;
        private String type;
        private String extractedText;
        private String riskLevel;
        private Integer riskScore;
        private String explanation;
        private Double templateSimilarityScore;
        private boolean deviationFlagged;
        private boolean isOneSided;
        private String oneSidedExplanation;
        private boolean isUnusual;
        private String unusualExplanation;
        private String expectedStandardLanguage;
        private boolean reviewed;
        private String reviewerNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewRequest {
        private String reviewerNotes;
        private boolean reviewed;
    }
}

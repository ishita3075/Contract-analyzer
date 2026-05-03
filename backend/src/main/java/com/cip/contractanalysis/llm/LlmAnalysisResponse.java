package com.cip.contractanalysis.llm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

/**
 * Represents the structured JSON response expected from the LLM analysis.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LlmAnalysisResponse {

    private List<LlmClause> clauses;
    private List<LlmMissingClause> missingClauses;
    private String oneSidedClausesSummary;
    private String unusualTermsSummary;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LlmClause {
        private String clauseType;
        private String extractedText;
        private String riskLevel;
        private Integer riskScore;
        private String explanation;
        private Boolean isOneSided;
        private String oneSidedExplanation;
        private Boolean isUnusual;
        private String unusualExplanation;
        private String expectedStandardLanguage;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LlmMissingClause {
        private String clauseType;
        private String severity;
        private String explanation;
    }
}

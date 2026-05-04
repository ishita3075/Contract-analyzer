package com.cip.contractanalysis.llm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

/**
 * Represents the structured JSON response expected from the LLM analysis.
 */
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LlmAnalysisResponse {

    public static LlmAnalysisResponse merge(List<LlmAnalysisResponse> responses) {
        if (responses == null || responses.isEmpty()) return null;
        if (responses.size() == 1) return responses.get(0);

        LlmAnalysisResponse merged = new LlmAnalysisResponse();
        merged.setClauses(new ArrayList<>());
        merged.setMissingClauses(new ArrayList<>());
        
        Set<String> seenClauses = new HashSet<>();
        Set<String> seenMissing = new HashSet<>();

        // Take the contract metadata from the first chunk that identifies it
        for (LlmAnalysisResponse res : responses) {
            if (Boolean.TRUE.equals(res.getIsContract())) {
                merged.setIsContract(true);
                merged.setContractType(res.getContractType());
                merged.setValidationMessage(res.getValidationMessage());
                break;
            }
        }
        
        if (merged.getIsContract() == null) {
            merged.setIsContract(responses.get(0).getIsContract());
            merged.setContractType(responses.get(0).getContractType());
            merged.setValidationMessage(responses.get(0).getValidationMessage());
        }

        for (LlmAnalysisResponse res : responses) {
            if (res.getClauses() != null) {
                for (LlmClause clause : res.getClauses()) {
                    String key = (clause.getClauseType() + ":" + clause.getExtractedText().trim().toLowerCase()).hashCode() + "";
                    if (!seenClauses.contains(key)) {
                        merged.getClauses().add(clause);
                        seenClauses.add(key);
                    }
                }
            }
            if (res.getMissingClauses() != null) {
                for (LlmMissingClause mc : res.getMissingClauses()) {
                    if (!seenMissing.contains(mc.getClauseType().toLowerCase())) {
                        merged.getMissingClauses().add(mc);
                        seenMissing.add(mc.getClauseType().toLowerCase());
                    }
                }
            }
        }

        return merged;
    }


    private List<LlmClause> clauses;
    private List<LlmMissingClause> missingClauses;
    private String oneSidedClausesSummary;
    private String unusualTermsSummary;

    private Boolean isContract;
    private String contractType;
    private String validationMessage;

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

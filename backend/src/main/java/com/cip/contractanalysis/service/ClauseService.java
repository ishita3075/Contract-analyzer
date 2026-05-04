package com.cip.contractanalysis.service;

import com.cip.contractanalysis.dto.ClauseDto;
import com.cip.contractanalysis.entity.*;
import com.cip.contractanalysis.exception.*;
import com.cip.contractanalysis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClauseService {

    private final ClauseRepository clauseRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public List<ClauseDto.ClauseDetail> getClausesForDocument(
            String documentId, String type, String riskLevel, String userEmail) {

        Document doc = documentRepository.findByIdAndDeletedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        List<Clause> clauses;
        if (type != null && riskLevel != null) {
            clauses = clauseRepository.findByDocumentAndClauseTypeAndRiskLevel(
                    doc, type, Document.RiskLevel.valueOf(riskLevel.toUpperCase()));
        } else if (type != null) {
            clauses = clauseRepository.findByDocumentAndClauseType(doc, type);
        } else if (riskLevel != null) {
            clauses = clauseRepository.findByDocumentAndRiskLevel(doc, Document.RiskLevel.valueOf(riskLevel.toUpperCase()));
        } else {
            clauses = clauseRepository.findByDocument(doc);
        }

        return clauses.stream().map(this::toDetail).collect(Collectors.toList());
    }

    public ClauseDto.ClauseDetail getClause(String clauseId, String userEmail) {
        Clause clause = clauseRepository.findById(clauseId)
                .orElseThrow(() -> new ResourceNotFoundException("Clause not found: " + clauseId));
        return toDetail(clause);
    }

    @Transactional
    public ClauseDto.ClauseDetail reviewClause(String clauseId, ClauseDto.ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Clause clause = clauseRepository.findById(clauseId)
                .orElseThrow(() -> new ResourceNotFoundException("Clause not found"));

        clause.setReviewed(request.isReviewed());
        clause.setReviewerNotes(request.getReviewerNotes());
        clause.setReviewedBy(user);
        clause.setReviewedAt(LocalDateTime.now());
        clause = clauseRepository.save(clause);

        return toDetail(clause);
    }

    private ClauseDto.ClauseDetail toDetail(Clause c) {
        return ClauseDto.ClauseDetail.builder()
                .clauseId(c.getId())
                .type(c.getClauseType())
                .extractedText(c.getExtractedText())
                .riskLevel(c.getRiskLevel() != null ? c.getRiskLevel().name() : null)
                .riskScore(c.getRiskScore())
                .explanation(c.getExplanation())
                .templateSimilarityScore(c.getTemplateSimilarityScore())
                .deviationFlagged(c.isDeviationFlagged())
                .isOneSided(c.isOneSided())
                .oneSidedExplanation(c.getOneSidedExplanation())
                .isUnusual(c.isUnusual())
                .unusualExplanation(c.getUnusualExplanation())
                .expectedStandardLanguage(c.getExpectedStandardLanguage())
                .reviewed(c.isReviewed())
                .reviewerNotes(c.getReviewerNotes())
                .build();
    }
}

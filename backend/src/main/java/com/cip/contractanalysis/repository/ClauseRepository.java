package com.cip.contractanalysis.repository;

import com.cip.contractanalysis.entity.Clause;
import com.cip.contractanalysis.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClauseRepository extends JpaRepository<Clause, String> {
    List<Clause> findByDocument(Document document);
    List<Clause> findByDocumentAndClauseType(Document document, String clauseType);
    List<Clause> findByDocumentAndRiskLevel(Document document, Document.RiskLevel riskLevel);
    List<Clause> findByDocumentAndClauseTypeAndRiskLevel(Document document, String clauseType, Document.RiskLevel riskLevel);
    void deleteByDocument(Document document);
}

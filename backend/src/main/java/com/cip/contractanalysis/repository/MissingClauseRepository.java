package com.cip.contractanalysis.repository;

import com.cip.contractanalysis.entity.MissingClause;
import com.cip.contractanalysis.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MissingClauseRepository extends JpaRepository<MissingClause, String> {
    List<MissingClause> findByDocument(Document document);
    void deleteByDocument(Document document);
}

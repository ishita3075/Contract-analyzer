package com.cip.contractanalysis.repository;

import com.cip.contractanalysis.entity.Document;
import com.cip.contractanalysis.entity.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, String> {

    Page<Document> findByOrganizationAndDeletedFalse(Organization organization, Pageable pageable);

    Optional<Document> findByIdAndDeletedFalse(String id);

    @Query("SELECT d FROM Document d WHERE d.organization = :org AND d.deleted = false AND " +
           "(LOWER(d.filename) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Document> searchByOrganization(@Param("org") Organization org,
                                        @Param("search") String search,
                                        Pageable pageable);

    long countByOrganizationAndDeletedFalse(Organization organization);

    long countByOrganizationAndOverallRiskLevelAndDeletedFalse(
            Organization organization, Document.RiskLevel riskLevel);
}

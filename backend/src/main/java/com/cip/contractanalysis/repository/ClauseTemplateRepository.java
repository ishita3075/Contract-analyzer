package com.cip.contractanalysis.repository;

import com.cip.contractanalysis.entity.ClauseTemplate;
import com.cip.contractanalysis.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClauseTemplateRepository extends JpaRepository<ClauseTemplate, String> {
    List<ClauseTemplate> findByOrganization(Organization organization);
    Optional<ClauseTemplate> findByClauseTypeAndOrganization(String clauseType, Organization organization);
}

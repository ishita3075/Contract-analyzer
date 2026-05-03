package com.cip.contractanalysis.repository;

import com.cip.contractanalysis.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    Page<AuditLog> findAll(Pageable pageable);
    List<AuditLog> findByDocumentId(String documentId);
    Page<AuditLog> findByEventType(String eventType, Pageable pageable);
    Page<AuditLog> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
}

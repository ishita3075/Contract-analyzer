package com.cip.contractanalysis.service;

import com.cip.contractanalysis.dto.AuditLogDto;
import com.cip.contractanalysis.entity.*;
import com.cip.contractanalysis.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(String eventType, String actorEmail, String documentId, String details) {
        try {
            User actor = userRepository.findByEmail(actorEmail).orElse(null);
            AuditLog entry = AuditLog.builder()
                    .eventType(eventType)
                    .actor(actor)
                    .documentId(documentId)
                    .details(details)
                    .ipAddress("127.0.0.1") // Replace with real IP from request context
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to write audit log: {}", e.getMessage());
        }
    }

    public Page<AuditLogDto> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findAll(pageable).map(this::toDto);
    }

    public List<AuditLogDto> getAuditLogsForDocument(String documentId) {
        return auditLogRepository.findByDocumentId(documentId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    private AuditLogDto toDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .eventType(auditLog.getEventType())
                .actorName(auditLog.getActor() != null ? auditLog.getActor().getName() : "System")
                .actorEmail(auditLog.getActor() != null ? auditLog.getActor().getEmail() : null)
                .documentId(auditLog.getDocumentId())
                .details(auditLog.getDetails())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}

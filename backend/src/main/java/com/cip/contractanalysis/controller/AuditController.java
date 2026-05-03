package com.cip.contractanalysis.controller;

import com.cip.contractanalysis.dto.AuditLogDto;
import com.cip.contractanalysis.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLogDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.getAuditLogs(page, size));
    }

    @GetMapping("/logs/{documentId}")
    public ResponseEntity<List<AuditLogDto>> getLogsForDocument(@PathVariable String documentId) {
        return ResponseEntity.ok(auditService.getAuditLogsForDocument(documentId));
    }
}

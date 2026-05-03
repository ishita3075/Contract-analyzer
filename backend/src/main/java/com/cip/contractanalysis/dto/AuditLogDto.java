package com.cip.contractanalysis.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private String id;
    private String eventType;
    private String actorName;
    private String actorEmail;
    private String documentId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}

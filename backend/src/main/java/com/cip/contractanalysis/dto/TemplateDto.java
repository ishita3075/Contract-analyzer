package com.cip.contractanalysis.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

public class TemplateDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateResponse {
        private String id;
        private String clauseType;
        private String name;
        private String standardText;
        private String description;
        private Integer version;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class CreateRequest {
        @NotBlank
        private String clauseType;
        @NotBlank
        private String name;
        @NotBlank
        private String standardText;
        private String description;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private String standardText;
        private String description;
    }
}

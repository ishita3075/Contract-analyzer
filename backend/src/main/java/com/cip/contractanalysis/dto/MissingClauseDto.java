package com.cip.contractanalysis.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissingClauseDto {
    private String id;
    private String clauseType;
    private String severity;
    private String explanation;
}

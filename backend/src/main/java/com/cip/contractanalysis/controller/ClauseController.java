package com.cip.contractanalysis.controller;

import com.cip.contractanalysis.dto.ClauseDto;
import com.cip.contractanalysis.service.ClauseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ClauseController {

    private final ClauseService clauseService;

    @GetMapping("/documents/{documentId}/clauses")
    public ResponseEntity<List<ClauseDto.ClauseDetail>> getClauses(
            @PathVariable String documentId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String riskLevel,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                clauseService.getClausesForDocument(documentId, type, riskLevel, userDetails.getUsername()));
    }

    @GetMapping("/clauses/{id}")
    public ResponseEntity<ClauseDto.ClauseDetail> getClause(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(clauseService.getClause(id, userDetails.getUsername()));
    }

    @PatchMapping("/clauses/{id}/review")
    public ResponseEntity<ClauseDto.ClauseDetail> reviewClause(
            @PathVariable String id,
            @RequestBody ClauseDto.ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(clauseService.reviewClause(id, request, userDetails.getUsername()));
    }
}

package com.cip.contractanalysis.controller;

import com.cip.contractanalysis.dto.TemplateDto;
import com.cip.contractanalysis.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<TemplateDto.TemplateResponse>> listTemplates(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(templateService.listTemplates(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<TemplateDto.TemplateResponse> createTemplate(
            @Valid @RequestBody TemplateDto.CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateService.createTemplate(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateDto.TemplateResponse> updateTemplate(
            @PathVariable String id,
            @RequestBody TemplateDto.UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(templateService.updateTemplate(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}

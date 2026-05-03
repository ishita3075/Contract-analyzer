package com.cip.contractanalysis.controller;

import com.cip.contractanalysis.dto.DocumentDto;
import com.cip.contractanalysis.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto.UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.accepted()
                .body(documentService.uploadDocument(file, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<Page<DocumentDto.DocumentSummary>> listDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(documentService.listDocuments(userDetails.getUsername(), page, size, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto.DocumentSummary> getDocument(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(documentService.getDocumentSummary(id, userDetails.getUsername()));
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<DocumentDto.DocumentAnalysis> getAnalysis(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(documentService.getDocumentAnalysis(id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        documentService.deleteDocument(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

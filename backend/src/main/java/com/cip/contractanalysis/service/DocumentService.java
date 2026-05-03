package com.cip.contractanalysis.service;

import com.cip.contractanalysis.dto.*;
import com.cip.contractanalysis.entity.*;
import com.cip.contractanalysis.exception.*;
import com.cip.contractanalysis.llm.*;
import com.cip.contractanalysis.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ClauseRepository clauseRepository;
    private final MissingClauseRepository missingClauseRepository;
    private final ClauseTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final LlmService llmService;
    private final Tika tika;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword");

    @Transactional
    public DocumentDto.UploadResponse uploadDocument(MultipartFile file, String uploaderEmail) {
        validateFile(file);

        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Save file to local disk (replace with S3 in production)
        String storageKey = saveFileToDisk(file);

        Document doc = Document.builder()
                .filename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .fileStorageKey(storageKey)
                .status(Document.AnalysisStatus.UPLOADED)
                .uploadedBy(uploader)
                .organization(uploader.getOrganization())
                .build();

        doc = documentRepository.save(doc);
        final String docId = doc.getId();

        auditService.log("DOCUMENT_UPLOADED", uploaderEmail, docId,
                "Document uploaded: " + file.getOriginalFilename());

        // Trigger async analysis
        triggerAnalysis(docId, uploaderEmail);

        return DocumentDto.UploadResponse.builder()
                .documentId(docId)
                .filename(file.getOriginalFilename())
                .status("UPLOADED")
                .message("Document uploaded successfully. Analysis in progress.")
                .build();
    }

    @Async
    public void triggerAnalysis(String documentId, String uploaderEmail) {
        try {
            analyzeDocument(documentId, uploaderEmail);
        } catch (Exception e) {
            log.error("Async analysis failed for document {}: {}", documentId, e.getMessage(), e);
            documentRepository.findById(documentId).ifPresent(doc -> {
                doc.setStatus(Document.AnalysisStatus.FAILED);
                documentRepository.save(doc);
            });
        }
    }

    @Transactional
    public void analyzeDocument(String documentId, String uploaderEmail) throws IOException, TikaException {
        Document doc = documentRepository.findByIdAndDeletedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Step 1: Parse text
        doc.setStatus(Document.AnalysisStatus.PARSING);
        documentRepository.save(doc);

        String extractedText = extractText(doc.getFileStorageKey());
        doc.setExtractedText(extractedText);

        // Step 2: LLM Analysis
        doc.setStatus(Document.AnalysisStatus.ANALYZING);
        documentRepository.save(doc);

        LlmAnalysisResponse llmResponse = llmService.analyzeContract(extractedText);

        // Step 3: Persist clauses
        clauseRepository.deleteByDocument(doc);
        missingClauseRepository.deleteByDocument(doc);

        List<Clause> clauses = new ArrayList<>();
        for (LlmAnalysisResponse.LlmClause lc : llmResponse.getClauses()) {
            double similarityScore = computeSimilarity(lc.getExtractedText(), lc.getClauseType(),
                    doc.getOrganization());
            Clause clause = Clause.builder()
                    .document(doc)
                    .clauseType(lc.getClauseType())
                    .extractedText(lc.getExtractedText())
                    .riskLevel(parseRisk(lc.getRiskLevel()))
                    .riskScore(lc.getRiskScore())
                    .explanation(lc.getExplanation())
                    .templateSimilarityScore(similarityScore)
                    .deviationFlagged(similarityScore < 0.75)
                    .oneSided(Boolean.TRUE.equals(lc.getIsOneSided()))
                    .oneSidedExplanation(lc.getOneSidedExplanation())
                    .unusual(Boolean.TRUE.equals(lc.getIsUnusual()))
                    .unusualExplanation(lc.getUnusualExplanation())
                    .expectedStandardLanguage(lc.getExpectedStandardLanguage())
                    .build();
            clauses.add(clause);
        }
        clauseRepository.saveAll(clauses);

        // Persist missing clauses
        List<MissingClause> missingClauses = llmResponse.getMissingClauses().stream()
                .map(mc -> MissingClause.builder()
                        .document(doc)
                        .clauseType(mc.getClauseType())
                        .severity(parseSeverity(mc.getSeverity()))
                        .explanation(mc.getExplanation())
                        .build())
                .collect(Collectors.toList());
        missingClauseRepository.saveAll(missingClauses);

        // Compute aggregate risk
        int avgRisk = clauses.stream()
                .mapToInt(c -> c.getRiskScore() != null ? c.getRiskScore() : 0)
                .sum();
        int overallScore = clauses.isEmpty() ? 0 : avgRisk / clauses.size();
        Document.RiskLevel overallLevel = overallScore >= 70 ? Document.RiskLevel.HIGH
                : overallScore >= 40 ? Document.RiskLevel.MEDIUM : Document.RiskLevel.LOW;

        doc.setOverallRiskScore(overallScore);
        doc.setOverallRiskLevel(overallLevel);
        doc.setStatus(Document.AnalysisStatus.ANALYZED);
        doc.setAnalyzedAt(LocalDateTime.now());
        documentRepository.save(doc);

        auditService.log("DOCUMENT_ANALYZED", uploaderEmail, documentId,
                String.format("Analysis complete. Risk: %s (%d). Clauses: %d, Missing: %d",
                        overallLevel, overallScore, clauses.size(), missingClauses.size()));

        log.info("Analysis complete for document {}: {} ({}/100)", documentId, overallLevel, overallScore);
    }

    public Page<DocumentDto.DocumentSummary> listDocuments(String userEmail, int page, int size, String search) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Document> docs = (search != null && !search.isBlank())
                ? documentRepository.searchByOrganization(user.getOrganization(), search, pageable)
                : documentRepository.findByOrganizationAndDeletedFalse(user.getOrganization(), pageable);

        return docs.map(this::toSummary);
    }

    public DocumentDto.DocumentSummary getDocumentSummary(String id, String userEmail) {
        Document doc = getAndValidate(id, userEmail);
        return toSummary(doc);
    }

    public DocumentDto.DocumentAnalysis getDocumentAnalysis(String id, String userEmail) {
        Document doc = getAndValidate(id, userEmail);
        List<Clause> clauses = clauseRepository.findByDocument(doc);
        List<MissingClause> missing = missingClauseRepository.findByDocument(doc);

        long oneSidedCount = clauses.stream().filter(Clause::isOneSided).count();
        long unusualCount = clauses.stream().filter(Clause::isUnusual).count();

        return DocumentDto.DocumentAnalysis.builder()
                .documentId(doc.getId())
                .filename(doc.getFilename())
                .overallRiskScore(doc.getOverallRiskScore())
                .overallRiskLevel(doc.getOverallRiskLevel() != null ? doc.getOverallRiskLevel().name() : null)
                .clauseCount(clauses.size())
                .missingClauseCount(missing.size())
                .oneSidedClauseCount((int) oneSidedCount)
                .unusualTermCount((int) unusualCount)
                .clauses(clauses.stream().map(this::toClauseDetail).collect(Collectors.toList()))
                .missingClauses(missing.stream().map(this::toMissingClauseDto).collect(Collectors.toList()))
                .analyzedAt(doc.getAnalyzedAt())
                .build();
    }

    @Transactional
    public void deleteDocument(String id, String userEmail) {
        Document doc = getAndValidate(id, userEmail);
        doc.setDeleted(true);
        documentRepository.save(doc);
        auditService.log("DOCUMENT_DELETED", userEmail, id, "Document soft-deleted: " + doc.getFilename());
    }

    // ---- Private helpers ----

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new BadRequestException("File is required");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct))
            throw new BadRequestException("Only PDF and DOCX files are supported");
        if (file.getSize() > 50L * 1024 * 1024)
            throw new BadRequestException("File size must not exceed 50MB");
    }

    private String saveFileToDisk(MultipartFile file) {
        try {
            Path uploadDir = Paths.get("uploads");
            Files.createDirectories(uploadDir);
            String key = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadDir.resolve(key);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    private String extractText(String fileStorageKey) throws IOException, TikaException {
        File file = new File(fileStorageKey);
        if (!file.exists())
            throw new ResourceNotFoundException("Document file not found on disk");
        return tika.parseToString(file);
    }

    private double computeSimilarity(String clauseText, String clauseType, Organization org) {
        return templateRepository.findByClauseTypeAndOrganization(clauseType, org)
                .map(template -> tfIdfSimilarity(clauseText, template.getStandardText()))
                .orElse(0.5); // No template = neutral score
    }

    private double tfIdfSimilarity(String text1, String text2) {
        Set<String> words1 = tokenize(text1);
        Set<String> words2 = tokenize(text2);
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    private Set<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase().split("[^a-z0-9]+"))
                .filter(w -> w.length() > 2)
                .collect(Collectors.toSet());
    }

    private Document getAndValidate(String id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Document doc = documentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        if (!doc.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new BadRequestException("Access denied to this document");
        }
        return doc;
    }

    private Document.RiskLevel parseRisk(String level) {
        try {
            return Document.RiskLevel.valueOf(level.toUpperCase());
        } catch (Exception e) {
            return Document.RiskLevel.MEDIUM;
        }
    }

    private MissingClause.Severity parseSeverity(String severity) {
        try {
            return MissingClause.Severity.valueOf(severity.toUpperCase());
        } catch (Exception e) {
            return MissingClause.Severity.IMPORTANT;
        }
    }

    private DocumentDto.DocumentSummary toSummary(Document doc) {
        int clauseCount = doc.getClauses() != null ? doc.getClauses().size() : 0;
        int missingCount = doc.getMissingClauses() != null ? doc.getMissingClauses().size() : 0;
        return DocumentDto.DocumentSummary.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .contentType(doc.getContentType())
                .fileSizeBytes(doc.getFileSizeBytes())
                .status(doc.getStatus().name())
                .overallRiskScore(doc.getOverallRiskScore())
                .overallRiskLevel(doc.getOverallRiskLevel() != null ? doc.getOverallRiskLevel().name() : null)
                .clauseCount(clauseCount)
                .missingClauseCount(missingCount)
                .createdAt(doc.getCreatedAt())
                .analyzedAt(doc.getAnalyzedAt())
                .uploadedBy(doc.getUploadedBy() != null ? doc.getUploadedBy().getName() : null)
                .build();
    }

    private ClauseDto.ClauseDetail toClauseDetail(Clause c) {
        return ClauseDto.ClauseDetail.builder()
                .clauseId(c.getId())
                .type(c.getClauseType())
                .extractedText(c.getExtractedText())
                .riskLevel(c.getRiskLevel() != null ? c.getRiskLevel().name() : null)
                .riskScore(c.getRiskScore())
                .explanation(c.getExplanation())
                .templateSimilarityScore(c.getTemplateSimilarityScore())
                .deviationFlagged(c.isDeviationFlagged())
                .isOneSided(c.isOneSided())
                .oneSidedExplanation(c.getOneSidedExplanation())
                .isUnusual(c.isUnusual())
                .unusualExplanation(c.getUnusualExplanation())
                .expectedStandardLanguage(c.getExpectedStandardLanguage())
                .reviewed(c.isReviewed())
                .reviewerNotes(c.getReviewerNotes())
                .build();
    }

    private MissingClauseDto toMissingClauseDto(MissingClause mc) {
        return MissingClauseDto.builder()
                .id(mc.getId())
                .clauseType(mc.getClauseType())
                .severity(mc.getSeverity() != null ? mc.getSeverity().name() : null)
                .explanation(mc.getExplanation())
                .build();
    }
}

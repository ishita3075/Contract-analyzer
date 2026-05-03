package com.cip.contractanalysis.llm;

/**
 * Contract for LLM integration. Implementations: MockLlmService (dev) and OllamaLlmService (prod).
 */
public interface LlmService {
    /**
     * Analyzes contract text and returns structured analysis result.
     * @param contractText The extracted text from the document.
     * @return Structured LLM analysis response.
     */
    LlmAnalysisResponse analyzeContract(String contractText);
}

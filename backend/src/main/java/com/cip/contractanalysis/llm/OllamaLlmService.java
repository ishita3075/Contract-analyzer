package com.cip.contractanalysis.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;

/**
 * Real Ollama LLM service — active when llm.mock=false.
 */
@Service
@ConditionalOnExpression("'${llm.mock}' == 'false' and '${llm.provider}' == 'ollama'")
@RequiredArgsConstructor
@Slf4j
public class OllamaLlmService implements LlmService {

  @Value("${llm.ollama.base-url}")
  private String ollamaBaseUrl;

  @Value("${llm.ollama.model}")
  private String model;

  @Value("${llm.ollama.timeout-seconds}")
  private int timeoutSeconds;

  private final WebClient.Builder webClientBuilder;
  private final ObjectMapper objectMapper;

  private static final String SYSTEM_PROMPT = """
      You are a senior Indian legal analyst specializing in contract risk assessment under the Indian Contract Act, 1872, and related statutes.
      
      FIRST, determine if the provided text is actually a legal contract or agreement. 
      A document is a contract if it contains:
      1. Identification of parties (e.g., "This Agreement is made between...")
      2. Clear offer and acceptance terms.
      3. Consideration (payment, services, etc.)
      4. Binding legal obligations and signatures/execution blocks.

      Respond ONLY with a valid JSON object. No prose. No markdown. No explanations outside the JSON.

      Return EXACTLY this structure:
      {
        "isContract": boolean,
        "contractType": string (e.g., "NDA", "SaaS Agreement", "Employment Contract"),
        "validationMessage": string (Explain why it is or isn't a contract),
        "clauses": [
          {
            "clauseType": string,
            "extractedText": string,
            "riskLevel": "Low"|"Medium"|"High",
            "riskScore": 0-100,
            "explanation": string,
            "isOneSided": boolean,
            "oneSidedExplanation": string|null,
            "isUnusual": boolean,
            "unusualExplanation": string|null,
            "expectedStandardLanguage": string|null
          }
        ],
        "missingClauses": [
          {
            "clauseType": string,
            "severity": "Critical"|"Important"|"Recommended",
            "explanation": string
          }
        ],
        "oneSidedClausesSummary": string,
        "unusualTermsSummary": string
      }
      
      If "isContract" is false, you may leave "clauses" and "missingClauses" as empty arrays.
      """;

  @Override
  public LlmAnalysisResponse analyzeContract(String contractText) {
    log.info("Calling Ollama LLM at {} with model {}", ollamaBaseUrl, model);

    WebClient client = webClientBuilder.baseUrl(ollamaBaseUrl).build();

    Map<String, Object> requestBody = Map.of(
        "model", model,
        "messages", List.of(
            Map.of("role", "system", "content", SYSTEM_PROMPT),
            Map.of("role", "user", "content", contractText)),
        "stream", false,
        "format", "json",
        "options", Map.of("temperature", 0.1));

    try {
      String rawResponse = client.post()
          .uri("/api/chat")
          .bodyValue(requestBody)
          .retrieve()
          .bodyToMono(String.class)
          .timeout(Duration.ofSeconds(timeoutSeconds))
          .block();

      // Extract content from Ollama response
      var responseMap = objectMapper.readValue(rawResponse, Map.class);
      var message = (Map<?, ?>) responseMap.get("message");
      String content = (String) message.get("content");

      log.info("LLM Raw Content: {}", content);

      try {
        return objectMapper.readValue(content, LlmAnalysisResponse.class);
      } catch (Exception e) {
        log.error("Failed to parse LLM content as JSON: {}. Content: {}", e.getMessage(), content);
        // Fallback for non-contract documents if AI output is messy
        if (content.toLowerCase().contains("false") || content.toLowerCase().contains("not a contract")) {
          LlmAnalysisResponse fallback = new LlmAnalysisResponse();
          fallback.setIsContract(false);
          fallback.setValidationMessage("AI identified this as a non-contract document.");
          return fallback;
        }
        throw e;
      }

    } catch (Exception e) {
      log.error("Ollama LLM call failed: {}", e.getMessage(), e);
      throw new RuntimeException("LLM analysis failed: " + e.getMessage(), e);
    }

  }
}

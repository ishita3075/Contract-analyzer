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

/**
 * Real Ollama LLM service — active when llm.mock=false.
 */
@Service
@ConditionalOnProperty(name = "llm.mock", havingValue = "false")
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
      Analyze the contract text provided and perform a complete legal analysis.
      Respond ONLY with a valid JSON object. No prose. No markdown. No explanations outside the JSON.

      Return EXACTLY this structure:
      {
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

      return objectMapper.readValue(content, LlmAnalysisResponse.class);

    } catch (Exception e) {
      log.error("Ollama LLM call failed: {}", e.getMessage(), e);
      throw new RuntimeException("LLM analysis failed: " + e.getMessage(), e);
    }
  }
}

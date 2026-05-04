package com.cip.contractanalysis.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Groq Cloud LLM service — active when llm.provider=groq.
 */
@Service
@ConditionalOnExpression("'${llm.mock}' == 'false' and '${llm.provider}' == 'groq'")
@RequiredArgsConstructor
@Slf4j
public class GroqLlmService implements LlmService {

    @Value("${llm.groq.base-url}")
    private String groqBaseUrl;

    @Value("${llm.groq.model}")
    private String model;

    @Value("${llm.groq.api-key:}")
    private String apiKey;

    @Value("${llm.groq.timeout-seconds}")
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
          "contractType": string,
          "validationMessage": string,
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
          ]
        }
        """;

    @Override
    public LlmAnalysisResponse analyzeContract(String contractText) {
        log.info("Calling Groq Cloud API with model {}", model);

        WebClient client = webClientBuilder.baseUrl(groqBaseUrl).build();

        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", contractText)),
            "response_format", Map.of("type", "json_object"),
            "temperature", 0.1);

        try {
            String rawResponse = client.post()
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();

            var responseMap = objectMapper.readValue(rawResponse, Map.class);
            var choices = (List<?>) responseMap.get("choices");
            var firstChoice = (Map<?, ?>) choices.get(0);
            var message = (Map<?, ?>) firstChoice.get("message");
            String content = (String) message.get("content");

            return objectMapper.readValue(content, LlmAnalysisResponse.class);

        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Groq analysis failed: " + e.getMessage(), e);
        }
    }
}

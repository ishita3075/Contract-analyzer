package com.cip.contractanalysis.llm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Mock LLM service that returns realistic contract analysis data without
 * calling Ollama.
 * Active when llm.mock=true in application.yml.
 */
@Service
@ConditionalOnProperty(name = "llm.mock", havingValue = "true")
@Slf4j
public class MockLlmService implements LlmService {

        @Override
        public LlmAnalysisResponse analyzeContract(String contractText) {
                log.info("Mock LLM: Analyzing contract ({} chars)", contractText.length());

                // Simulate processing delay
                try {
                        Thread.sleep(2000);
                } catch (InterruptedException ignored) {
                }

                LlmAnalysisResponse response = new LlmAnalysisResponse();
                response.setIsContract(true);
                response.setContractType("Master Service Agreement");
                response.setValidationMessage("Document contains formal agreement structure, party definitions, and binding obligations.");

                // Generate realistic mock clauses
                response.setClauses(List.of(
                                buildClause("LIABILITY",
                                                "In no event shall Vendor be liable for any indirect, incidental, special, "
                                                                +
                                                                "exemplary, or consequential damages arising out of or in connection with this Agreement, "
                                                                +
                                                                "even if Vendor has been advised of the possibility of such damages. Vendor's total "
                                                                +
                                                                "liability shall not exceed INR 5,00,000 (Five Lakh Rupees).",
                                                "High", 85,
                                                "Liability cap of INR 5 Lakhs is disproportionately low for an IT services contract. "
                                                                +
                                                                "The exclusion of consequential damages is one-sided — it applies only to the Vendor, leaving "
                                                                +
                                                                "Client fully exposed. This deviates significantly from standard Indian IT service agreements.",
                                                true,
                                                "Liability exclusion applies exclusively to the Vendor. Client bears unlimited liability with no reciprocal cap.",
                                                true,
                                                "Standard Indian IT agreements typically provide mutual liability caps at 12 months contract value.",
                                                "Each party's liability shall be limited to the total fees paid in the preceding 12 months, "
                                                                +
                                                                "with mutual exclusion of consequential damages."),

                                buildClause("TERMINATION",
                                                "Either party may terminate this Agreement without cause by providing "
                                                                +
                                                                "7 (seven) days prior written notice to the other party. Upon termination, Client shall "
                                                                +
                                                                "immediately pay all outstanding amounts. Vendor may terminate immediately for any breach "
                                                                +
                                                                "without opportunity to cure.",
                                                "High", 78,
                                                "The 7-day notice period for termination is unusually short for a service agreement. "
                                                                +
                                                                "The absence of a cure period for breach is one-sided — Vendor can terminate immediately "
                                                                +
                                                                "for any breach while Client has no such right. This creates significant business continuity risk.",
                                                true,
                                                "Vendor may terminate immediately without cure period, but Client must provide 7-day notice for equivalent termination.",
                                                true,
                                                "Standard agreements provide 30-day notice and 15-day cure period for material breach.",
                                                "Either party may terminate for cause with 30 days written notice, providing a 15-day opportunity to cure material breach."),

                                buildClause("CONFIDENTIALITY",
                                                "Each party agrees to hold in confidence all Confidential Information "
                                                                +
                                                                "received from the other party and not to disclose it to any third party without prior written "
                                                                +
                                                                "consent. This obligation shall survive termination for a period of 3 (three) years.",
                                                "Low", 20,
                                                "The confidentiality clause is well-balanced with mutual obligations. "
                                                                +
                                                                "The 3-year survival period is standard for Indian commercial agreements. "
                                                                +
                                                                "No significant risk identified.",
                                                false, null, false, null, null),

                                buildClause("PAYMENT_TERMS",
                                                "Client shall pay all invoices within 90 (ninety) days of receipt. " +
                                                                "Late payments shall attract interest at 24% per annum. Vendor may suspend services "
                                                                +
                                                                "immediately upon non-payment without notice.",
                                                "Medium", 62,
                                                "90-day payment terms are longer than the standard 30-45 days in Indian commercial practice. "
                                                                +
                                                                "The 24% interest rate is at the upper limit permitted under Indian law. "
                                                                +
                                                                "Immediate suspension without notice creates operational risk for the Client.",
                                                true,
                                                "Vendor has unilateral right to suspend services without prior notice while Client bears extended payment obligations.",
                                                false, null, null),

                                buildClause("INTELLECTUAL_PROPERTY",
                                                "All intellectual property developed by Vendor under this " +
                                                                "Agreement, including customizations and derivative works, shall remain the exclusive "
                                                                +
                                                                "property of Vendor. Client receives a non-exclusive, non-transferable license to use "
                                                                +
                                                                "such IP solely for internal business purposes.",
                                                "Medium", 55,
                                                "Client does not own IP developed specifically for its business under this agreement. "
                                                                +
                                                                "For bespoke software development, clients typically expect work-for-hire ownership. "
                                                                +
                                                                "This clause may restrict Client's ability to switch vendors or build upon the developed IP.",
                                                true,
                                                "All developed IP, including client-specific customizations, remains with Vendor. Client only gets a limited use license.",
                                                false, null, null),

                                buildClause("GOVERNING_LAW",
                                                "This Agreement shall be governed by and construed in accordance " +
                                                                "with the laws of England and Wales. Any dispute shall be subject to the exclusive "
                                                                +
                                                                "jurisdiction of the courts of London.",
                                                "Medium", 48,
                                                "The governing law specifies England and Wales rather than India, which may create "
                                                                +
                                                                "significant cost and logistical challenges for an Indian entity pursuing enforcement. "
                                                                +
                                                                "This is atypical for agreements between Indian parties.",
                                                false, null,
                                                true,
                                                "Agreements between Indian parties should typically specify Indian governing law and jurisdiction (e.g., Delhi, Mumbai).",
                                                "This Agreement shall be governed by the laws of India. Courts at [City] shall have exclusive jurisdiction."),

                                buildClause("FORCE_MAJEURE",
                                                "Neither party shall be liable for delays or failures in performance " +
                                                                "resulting from causes beyond its reasonable control, including acts of God, natural disasters, "
                                                                +
                                                                "government actions, pandemics, or internet outages. The affected party must notify within 48 hours.",
                                                "Low", 15,
                                                "The force majeure clause is comprehensive and balanced. " +
                                                                "48-hour notification is reasonable. " +
                                                                "Coverage of pandemics post-COVID is appropriate.",
                                                false, null, false, null, null),

                                buildClause("DATA_PROTECTION",
                                                "Vendor shall implement reasonable security measures to protect " +
                                                                "Client data. In case of a data breach, Vendor shall notify Client within 72 hours. "
                                                                +
                                                                "Vendor may use Client data for service improvement and analytics purposes.",
                                                "High", 80,
                                                "The data protection clause is inadequate under India's DPDP Act 2023. "
                                                                +
                                                                "The permission to use Client data for analytics is a significant privacy risk. "
                                                                +
                                                                "No provision for data localisation, deletion rights, or cross-border transfer restrictions.",
                                                true,
                                                "Vendor can use Client's data for its own analytics without explicit consent, while Client bears all privacy compliance obligations.",
                                                true,
                                                "DPDP Act 2023 requires explicit consent for secondary data use, right to erasure, and data localisation provisions.",
                                                "Vendor shall process Client data solely as a data processor under Client's instructions, in compliance with DPDP Act 2023.")));

                // Missing clauses
                response.setMissingClauses(List.of(
                                buildMissing("DISPUTE_RESOLUTION", "Critical",
                                                "No arbitration or dispute resolution mechanism is specified. This forces expensive litigation. "
                                                                +
                                                                "Standard Indian commercial agreements include mandatory arbitration under the Arbitration and Conciliation Act, 1996."),
                                buildMissing("AUTO_RENEWAL", "Important",
                                                "No auto-renewal clause found. Without clear renewal terms, the agreement may lapse silently "
                                                                +
                                                                "or create ambiguity about continuing obligations after the initial term expires."),
                                buildMissing("SLA_PERFORMANCE_STANDARDS", "Important",
                                                "No SLA or performance standards defined for the Vendor's services. Without measurable KPIs, "
                                                                +
                                                                "Client has no contractual basis to claim service failures or remedies.")));

                response.setOneSidedClausesSummary(
                                "4 clauses identified as disproportionately favouring the Vendor: Liability exclusion, "
                                                +
                                                "unilateral termination, IP ownership retention, and data usage rights. "
                                                +
                                                "Significant renegotiation recommended before signing.");

                response.setUnusualTermsSummary(
                                "2 unusual terms detected: (1) English governing law for an India-based agreement, " +
                                                "and (2) Inadequate DPDP Act 2023 compliance provisions. Legal review strongly advised.");

                return response;
        }

        private LlmAnalysisResponse.LlmClause buildClause(
                        String type, String text, String risk, int score, String explanation,
                        boolean oneSided, String oneSidedExp,
                        boolean unusual, String unusualExp, String expectedLang) {

                LlmAnalysisResponse.LlmClause clause = new LlmAnalysisResponse.LlmClause();
                clause.setClauseType(type);
                clause.setExtractedText(text);
                clause.setRiskLevel(risk);
                clause.setRiskScore(score);
                clause.setExplanation(explanation);
                clause.setIsOneSided(oneSided);
                clause.setOneSidedExplanation(oneSidedExp);
                clause.setIsUnusual(unusual);
                clause.setUnusualExplanation(unusualExp);
                clause.setExpectedStandardLanguage(expectedLang);
                return clause;
        }

        private LlmAnalysisResponse.LlmMissingClause buildMissing(String type, String severity, String explanation) {
                LlmAnalysisResponse.LlmMissingClause mc = new LlmAnalysisResponse.LlmMissingClause();
                mc.setClauseType(type);
                mc.setSeverity(severity);
                mc.setExplanation(explanation);
                return mc;
        }
}

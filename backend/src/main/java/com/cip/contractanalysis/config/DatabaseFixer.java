package com.cip.contractanalysis.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Checking database constraints for DocumentStatus...");
        try {
            // Drop the old constraint and add the new one including INVALID_DOCUMENT
            // Note: This is specific to the name Hibernate gave the constraint
            jdbcTemplate.execute("ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check");
            jdbcTemplate.execute("ALTER TABLE documents ADD CONSTRAINT documents_status_check " +
                    "CHECK (status IN ('UPLOADED', 'PARSING', 'ANALYZING', 'ANALYZED', 'FAILED', 'INVALID_DOCUMENT'))");
            log.info("Database constraint 'documents_status_check' updated successfully.");
        } catch (Exception e) {
            log.warn("Could not update database constraint (it might not exist or name might differ): {}", e.getMessage());
        }
    }
}

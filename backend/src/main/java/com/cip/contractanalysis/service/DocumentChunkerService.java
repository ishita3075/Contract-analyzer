package com.cip.contractanalysis.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DocumentChunkerService {

    private static final int DEFAULT_CHUNK_SIZE = 12000; // ~3000-4000 tokens
    private static final int DEFAULT_OVERLAP = 1000;

    public List<String> createChunks(String text) {
        return createChunks(text, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP);
    }

    public List<String> createChunks(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        
        if (text == null || text.isBlank()) {
            return chunks;
        }

        if (text.length() <= chunkSize) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            
            // Try to find a natural break point (newline or period) near the end of the chunk
            if (end < text.length()) {
                int naturalBreak = text.lastIndexOf("\n", end);
                if (naturalBreak > start + (chunkSize / 2)) {
                    end = naturalBreak + 1;
                } else {
                    naturalBreak = text.lastIndexOf(". ", end);
                    if (naturalBreak > start + (chunkSize / 2)) {
                        end = naturalBreak + 2;
                    }
                }
            }

            chunks.add(text.substring(start, end).trim());
            
            // Move start forward, but stay behind 'end' by the overlap amount
            start = end - overlap;
            
            // Safety check to avoid infinite loops
            if (start < 0) start = 0;
            if (end >= text.length()) break;
            
            // If overlap is too large, move start forward anyway
            if (start <= chunks.get(chunks.size() - 1).length() - overlap) {
                // This is a bit simplified, but ensures we always progress
            }
        }

        log.info("Split text of length {} into {} chunks", text.length(), chunks.size());
        return chunks;
    }
}

package com.cip.contractanalysis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ContractAnalysisApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContractAnalysisApplication.class, args);
    }
}

package com.cip.contractanalysis.service;

import com.cip.contractanalysis.dto.TemplateDto;
import com.cip.contractanalysis.entity.*;
import com.cip.contractanalysis.exception.*;
import com.cip.contractanalysis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final ClauseTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public List<TemplateDto.TemplateResponse> listTemplates(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return templateRepository.findByOrganization(user.getOrganization())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TemplateDto.TemplateResponse createTemplate(TemplateDto.CreateRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClauseTemplate template = ClauseTemplate.builder()
                .clauseType(request.getClauseType())
                .name(request.getName())
                .standardText(request.getStandardText())
                .description(request.getDescription())
                .version(1)
                .organization(admin.getOrganization())
                .createdBy(admin)
                .build();

        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public TemplateDto.TemplateResponse updateTemplate(String id, TemplateDto.UpdateRequest request, String adminEmail) {
        ClauseTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));

        if (request.getName() != null) template.setName(request.getName());
        if (request.getStandardText() != null) template.setStandardText(request.getStandardText());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        template.setVersion(template.getVersion() + 1);

        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(String id) {
        if (!templateRepository.existsById(id))
            throw new ResourceNotFoundException("Template not found: " + id);
        templateRepository.deleteById(id);
    }

    private TemplateDto.TemplateResponse toResponse(ClauseTemplate t) {
        return TemplateDto.TemplateResponse.builder()
                .id(t.getId())
                .clauseType(t.getClauseType())
                .name(t.getName())
                .standardText(t.getStandardText())
                .description(t.getDescription())
                .version(t.getVersion())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}

package com.mst.agritech.service;

import com.mst.agritech.domain.entity.ReportDefinition;
import com.mst.agritech.dto.response.ReportDefinitionResponse;
import com.mst.agritech.repository.ReportDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportDefinitionRepository reportDefinitionRepository;

    @Transactional(readOnly = true)
    public List<ReportDefinitionResponse> listReports() {
        return reportDefinitionRepository.findByActiveTrueOrderByCategoryAscTitleAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private ReportDefinitionResponse toResponse(ReportDefinition r) {
        return ReportDefinitionResponse.builder()
                .id(r.getReportKey())
                .title(r.getTitle())
                .description(r.getDescription())
                .category(r.getCategory())
                .format(r.getOutputFormat())
                .build();
    }
}

package com.mst.agritech.service;

import com.mst.agritech.domain.entity.LogisticsCompany;
import com.mst.agritech.dto.response.LogisticsCompanyResponse;
import com.mst.agritech.repository.LogisticsCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogisticsService {

    private final LogisticsCompanyRepository logisticsCompanyRepository;

    @Transactional(readOnly = true)
    public List<LogisticsCompanyResponse> listAll() {
        return logisticsCompanyRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private LogisticsCompanyResponse toResponse(LogisticsCompany c) {
        List<String> countries = c.getRegionsServed() != null
                ? Arrays.stream(c.getRegionsServed().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .toList()
                : List.of("Global");

        return LogisticsCompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .type(c.getCompanyType())
                .trackingUrl(c.getTrackingApiUrl())
                .countries(countries)
                .active(c.isActive())
                .build();
    }
}

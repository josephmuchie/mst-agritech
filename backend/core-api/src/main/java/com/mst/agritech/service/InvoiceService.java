package com.mst.agritech.service;

import com.mst.agritech.domain.entity.InvoiceHeader;
import com.mst.agritech.domain.entity.InvoiceLine;
import com.mst.agritech.dto.oracle.*;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.InvoiceDistributionRepository;
import com.mst.agritech.repository.InvoiceHeaderRepository;
import com.mst.agritech.repository.InvoiceLineRepository;
import com.mst.agritech.util.OracleDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceHeaderRepository headerRepository;
    private final InvoiceLineRepository lineRepository;
    private final InvoiceDistributionRepository distributionRepository;

    @Transactional(readOnly = true)
    public OracleCollectionResponse<InvoiceHeaderDto> listHeaders(int limit, int offset) {
        int page = offset / Math.max(limit, 1);
        Page<InvoiceHeader> result = headerRepository.findAllByOrderByCreationDateDesc(
                PageRequest.of(page, limit));
        return toCollection(result.map(OracleDtoMapper::toHeaderDto).getContent(),
                (int) result.getTotalElements(), limit, offset);
    }

    @Transactional(readOnly = true)
    public InvoiceHeaderDto getHeader(String invoiceId) {
        return OracleDtoMapper.toHeaderDto(findHeader(invoiceId));
    }

    @Transactional(readOnly = true)
    public OracleCollectionResponse<InvoiceLineDto> listLines(String invoiceId) {
        findHeader(invoiceId);
        List<InvoiceLineDto> items = lineRepository
                .findByInvoiceHeaderInvoiceIdOrderByLineNumberAsc(invoiceId)
                .stream()
                .map(OracleDtoMapper::toLineDto)
                .toList();
        return toCollection(items, items.size(), items.size(), 0);
    }

    @Transactional(readOnly = true)
    public OracleCollectionResponse<InvoiceDistributionDto> listDistributions(
            String invoiceId, String invoiceLineId) {
        InvoiceLine line = lineRepository.findByInvoiceLineId(invoiceLineId)
                .orElseThrow(() -> new ResourceNotFoundException("InvoiceLine", invoiceLineId));
        if (!line.getInvoiceHeader().getInvoiceId().equals(invoiceId)) {
            throw new ResourceNotFoundException("InvoiceLine", invoiceLineId);
        }
        List<InvoiceDistributionDto> items = distributionRepository
                .findByInvoiceLineInvoiceLineIdOrderByDistributionLineNumberAsc(invoiceLineId)
                .stream()
                .map(OracleDtoMapper::toDistributionDto)
                .toList();
        return toCollection(items, items.size(), items.size(), 0);
    }

    private InvoiceHeader findHeader(String invoiceId) {
        return headerRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
    }

    private <T> OracleCollectionResponse<T> toCollection(
            List<T> items, int total, int limit, int offset) {
        boolean hasMore = offset + items.size() < total;
        return OracleCollectionResponse.<T>builder()
                .items(items)
                .count(items.size())
                .hasMore(hasMore)
                .totalResults(total)
                .limit(limit)
                .offset(offset)
                .build();
    }
}

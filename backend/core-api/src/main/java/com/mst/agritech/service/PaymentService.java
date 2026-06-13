package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Payment;
import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.oracle.PaymentDto;
import com.mst.agritech.dto.response.PaymentListResponse;
import com.mst.agritech.dto.response.PaymentSummaryResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.PaymentRepository;
import com.mst.agritech.util.OracleDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Page<PaymentListResponse> list(Pageable pageable) {
        return paymentRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toListResponse);
    }

    @Transactional(readOnly = true)
    public PaymentSummaryResponse getSummary() {
        return PaymentSummaryResponse.builder()
                .totalReceivedUsd(paymentRepository.sumCompletedUsd())
                .pendingCount(paymentRepository.countByStatus("PENDING"))
                .completedCount(paymentRepository.countByStatus("COMPLETED"))
                .failedCount(paymentRepository.countByStatus("FAILED"))
                .build();
    }

    @Transactional(readOnly = true)
    public OracleCollectionResponse<PaymentDto> listOracle(int limit, int offset) {
        int page = offset / Math.max(limit, 1);
        Page<Payment> result = paymentRepository.findAllByOrderByCreatedAtDesc(
                org.springframework.data.domain.PageRequest.of(page, limit));
        List<PaymentDto> items = result.getContent().stream()
                .map(OracleDtoMapper::toPaymentDto)
                .toList();
        int total = (int) result.getTotalElements();
        return OracleCollectionResponse.<PaymentDto>builder()
                .items(items)
                .count(items.size())
                .hasMore(offset + items.size() < total)
                .totalResults(total)
                .limit(limit)
                .offset(offset)
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentDto getOracle(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        return OracleDtoMapper.toPaymentDto(payment);
    }

    private PaymentListResponse toListResponse(Payment p) {
        return PaymentListResponse.builder()
                .id(p.getId())
                .reference(p.getTransactionId() != null ? p.getTransactionId() : "PAY-" + p.getId())
                .orderRef(p.getOrder().getReference())
                .amount(p.getAmount())
                .currencyCode(p.getCurrency().getCode())
                .gateway(p.getGateway())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}

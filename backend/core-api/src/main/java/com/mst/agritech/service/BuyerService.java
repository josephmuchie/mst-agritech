package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Buyer;
import com.mst.agritech.dto.response.BuyerResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.BuyerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BuyerService {

    private final BuyerRepository buyerRepository;

    public Page<BuyerResponse> findAll(Pageable pageable) {
        return buyerRepository.findAll(pageable).map(this::toResponse);
    }

    public BuyerResponse findById(Long id) {
        return toResponse(buyerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer", id)));
    }

    @Transactional
    public BuyerResponse verify(Long id) {
        Buyer buyer = buyerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer", id));
        buyer.setVerified(true);
        return toResponse(buyerRepository.save(buyer));
    }

    private BuyerResponse toResponse(Buyer b) {
        return BuyerResponse.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .companyName(b.getCompanyName())
                .countryName(b.getCountry().getName())
                .buyerType(b.getBuyerType())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .verified(b.isVerified())
                .createdAt(b.getCreatedAt())
                .build();
    }
}

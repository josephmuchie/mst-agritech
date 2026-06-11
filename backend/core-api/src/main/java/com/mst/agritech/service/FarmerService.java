package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Farmer;
import com.mst.agritech.dto.response.FarmerResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;

    public Page<FarmerResponse> findAll(Pageable pageable) {
        return farmerRepository.findAll(pageable).map(this::toResponse);
    }

    public FarmerResponse findById(Long id) {
        return toResponse(farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", id)));
    }

    @Transactional
    public FarmerResponse verify(Long id) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", id));
        farmer.setVerified(true);
        farmer.setVerifiedAt(java.time.LocalDateTime.now());
        return toResponse(farmerRepository.save(farmer));
    }

    public long countVerified() {
        return farmerRepository.countByVerifiedTrue();
    }

    private FarmerResponse toResponse(Farmer f) {
        return FarmerResponse.builder()
                .id(f.getId())
                .userId(f.getUser().getId())
                .fullName(f.getUser().getFullName())
                .email(f.getUser().getEmail())
                .farmName(f.getFarmName())
                .province(f.getProvince())
                .countryName(f.getCountry().getName())
                .countryCode(f.getCountry().getIsoCode())
                .gpsLatitude(f.getGpsLatitude())
                .gpsLongitude(f.getGpsLongitude())
                .totalHectares(f.getTotalHectares())
                .verified(f.isVerified())
                .createdAt(f.getCreatedAt())
                .build();
    }
}

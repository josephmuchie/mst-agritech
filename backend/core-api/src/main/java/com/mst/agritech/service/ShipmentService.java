package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Shipment;
import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.oracle.ShipmentDto;
import com.mst.agritech.dto.response.ShipmentListResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.ShipmentRepository;
import com.mst.agritech.util.OracleDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    @Transactional(readOnly = true)
    public Page<ShipmentListResponse> list(Pageable pageable) {
        return shipmentRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toListResponse);
    }

    @Transactional(readOnly = true)
    public OracleCollectionResponse<ShipmentDto> listOracle(int limit, int offset) {
        int page = offset / Math.max(limit, 1);
        Page<Shipment> result = shipmentRepository.findAllByOrderByCreatedAtDesc(
                org.springframework.data.domain.PageRequest.of(page, limit));
        List<ShipmentDto> items = result.getContent().stream()
                .map(OracleDtoMapper::toShipmentDto)
                .toList();
        int total = (int) result.getTotalElements();
        return OracleCollectionResponse.<ShipmentDto>builder()
                .items(items)
                .count(items.size())
                .hasMore(offset + items.size() < total)
                .totalResults(total)
                .limit(limit)
                .offset(offset)
                .build();
    }

    @Transactional(readOnly = true)
    public ShipmentDto getOracle(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", shipmentId));
        return OracleDtoMapper.toShipmentDto(shipment);
    }

    private ShipmentListResponse toListResponse(Shipment s) {
        ShipmentDto dto = OracleDtoMapper.toShipmentDto(s);
        return ShipmentListResponse.builder()
                .id(s.getId())
                .trackingNo(dto.getShipmentNumber())
                .carrier(dto.getCarrierName())
                .origin(dto.getOriginLocation())
                .destination(dto.getDestinationLocation())
                .status(s.getStatus())
                .eta(s.getEstimatedArrival())
                .build();
    }
}

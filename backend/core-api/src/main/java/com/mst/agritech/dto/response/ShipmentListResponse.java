package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentListResponse {
    private Long id;
    private String trackingNo;
    private String carrier;
    private String origin;
    private String destination;
    private String status;
    private LocalDateTime eta;
}

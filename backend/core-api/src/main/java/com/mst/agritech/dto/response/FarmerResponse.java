package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String farmName;
    private String province;
    private String countryName;
    private String countryCode;
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private BigDecimal totalHectares;
    private boolean verified;
    private LocalDateTime createdAt;
}

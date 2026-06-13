package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminProductResponse {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String unitOfMeasure;
    private String description;
    private String hsCode;
    private boolean requiresColdChain;
    private boolean active;
    private LocalDateTime createdAt;
}

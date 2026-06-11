package com.mst.agritech.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BuyerResponse {
    private Long id;
    private Long userId;
    private String companyName;
    private String countryName;
    private String buyerType;
    private String contactEmail;
    private String contactPhone;
    private boolean verified;
    private LocalDateTime createdAt;
}

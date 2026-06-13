package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Logistics carrier / freight company")
public class LogisticsCompanyResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "DHL Express")
    private String name;
    @Schema(example = "AIR")
    private String type;
    @Schema(example = "https://www.dhl.com/track")
    private String trackingUrl;
    @Schema(example = "[\"ZW\", \"AE\", \"GB\"]")
    private List<String> countries;
    @Schema(example = "true")
    private boolean active;
}

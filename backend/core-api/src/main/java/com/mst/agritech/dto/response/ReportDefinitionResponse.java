package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Report catalog entry")
public class ReportDefinitionResponse {
    @Schema(example = "sales-summary")
    private String id;
    @Schema(example = "Sales Summary")
    private String title;
    @Schema(example = "Monthly revenue breakdown by product and buyer country")
    private String description;
    @Schema(example = "Sales")
    private String category;
    @Schema(example = "PDF")
    private String format;
}

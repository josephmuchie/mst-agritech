package com.mst.agritech.dto.oracle;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Oracle Fusion invoice distribution resource")
public class InvoiceDistributionDto {

    @JsonProperty("InvoiceDistributionId")
    @Schema(example = "300001")
    private String invoiceDistributionId;

    @JsonProperty("InvoiceLineId")
    @Schema(example = "200001")
    private String invoiceLineId;

    @JsonProperty("DistributionLineNumber")
    @Schema(example = "1")
    private Integer distributionLineNumber;

    @JsonProperty("Amount")
    @Schema(example = "4200.00")
    private BigDecimal amount;

    @JsonProperty("DistCodeCombinationId")
    @Schema(description = "GL account combination", example = "40100-2100-000-0000-000")
    private String distCodeCombinationId;

    @JsonProperty("AccountingDate")
    @Schema(example = "2026-06-01")
    private String accountingDate;

    @JsonProperty("Description")
    @Schema(example = "Revenue - Flowers export")
    private String description;

    @JsonProperty("DistributionClass")
    @Schema(example = "Revenue")
    private String distributionClass;

    @JsonProperty("CreatedBy")
    @Schema(example = "ORACLE_IMPORT")
    private String createdBy;

    @JsonProperty("CreationDate")
    @Schema(example = "2026-06-01T08:00:00")
    private String creationDate;
}

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
@Schema(description = "Oracle Fusion invoice line resource")
public class InvoiceLineDto {

    @JsonProperty("InvoiceLineId")
    @Schema(example = "200001")
    private String invoiceLineId;

    @JsonProperty("InvoiceId")
    @Schema(example = "100001")
    private String invoiceId;

    @JsonProperty("LineNumber")
    @Schema(example = "1")
    private Integer lineNumber;

    @JsonProperty("LineTypeLookupCode")
    @Schema(example = "Item")
    private String lineTypeLookupCode;

    @JsonProperty("Amount")
    @Schema(example = "4200.00")
    private BigDecimal amount;

    @JsonProperty("QuantityInvoiced")
    @Schema(example = "1200.0000")
    private BigDecimal quantityInvoiced;

    @JsonProperty("UnitPrice")
    @Schema(example = "3.5000")
    private BigDecimal unitPrice;

    @JsonProperty("ItemDescription")
    @Schema(example = "Premium Roses - export grade")
    private String itemDescription;

    @JsonProperty("UOMCode")
    @Schema(example = "STEM")
    private String uomCode;

    @JsonProperty("TaxClassificationCode")
    @Schema(example = "VAT-ZW-15")
    private String taxClassificationCode;

    @JsonProperty("LineSource")
    @Schema(example = "PO")
    private String lineSource;

    @JsonProperty("CreatedBy")
    @Schema(example = "ORACLE_IMPORT")
    private String createdBy;

    @JsonProperty("CreationDate")
    @Schema(example = "2026-06-01T08:00:00")
    private String creationDate;
}

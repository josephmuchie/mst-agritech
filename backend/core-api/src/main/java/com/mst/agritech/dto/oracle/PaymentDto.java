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
@Schema(description = "Oracle-style payment transaction resource")
public class PaymentDto {

    @JsonProperty("PaymentId")
    @Schema(example = "1")
    private Long paymentId;

    @JsonProperty("PaymentNumber")
    @Schema(description = "Gateway transaction reference", example = "PAY-001")
    private String paymentNumber;

    @JsonProperty("OrderNumber")
    @Schema(example = "ORD-20260601-001")
    private String orderNumber;

    @JsonProperty("PaymentAmount")
    @Schema(example = "4200.00")
    private BigDecimal paymentAmount;

    @JsonProperty("PaymentCurrencyCode")
    @Schema(example = "USD")
    private String paymentCurrencyCode;

    @JsonProperty("PaymentMethodCode")
    @Schema(example = "STRIPE")
    private String paymentMethodCode;

    @JsonProperty("PaymentStatus")
    @Schema(example = "COMPLETED")
    private String paymentStatus;

    @JsonProperty("PaymentDate")
    @Schema(example = "2026-06-01T10:30:00")
    private String paymentDate;

    @JsonProperty("LastUpdateDate")
    @Schema(example = "2026-06-01T10:30:00")
    private String lastUpdateDate;
}

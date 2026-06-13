package com.mst.agritech.dto.oracle;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Oracle-style shipment / logistics resource")
public class ShipmentDto {

    @JsonProperty("ShipmentId")
    @Schema(example = "1")
    private Long shipmentId;

    @JsonProperty("ShipmentNumber")
    @Schema(description = "Carrier tracking number", example = "DHL-ZW-001234")
    private String shipmentNumber;

    @JsonProperty("OrderNumber")
    @Schema(example = "ORD-20260601-001")
    private String orderNumber;

    @JsonProperty("CarrierName")
    @Schema(example = "DHL Express")
    private String carrierName;

    @JsonProperty("ShipmentMode")
    @Schema(example = "AIR")
    private String shipmentMode;

    @JsonProperty("OriginLocation")
    @Schema(example = "Harare, ZW")
    private String originLocation;

    @JsonProperty("DestinationLocation")
    @Schema(example = "Dubai, AE")
    private String destinationLocation;

    @JsonProperty("ShipmentStatus")
    @Schema(example = "IN_TRANSIT")
    private String shipmentStatus;

    @JsonProperty("EstimatedArrivalDate")
    @Schema(example = "2026-06-18T14:00:00")
    private String estimatedArrivalDate;

    @JsonProperty("MinTemperatureCelsius")
    @Schema(example = "2.00")
    private String minTemperatureCelsius;

    @JsonProperty("MaxTemperatureCelsius")
    @Schema(example = "8.00")
    private String maxTemperatureCelsius;

    @JsonProperty("CreationDate")
    @Schema(example = "2026-06-01T08:00:00")
    private String creationDate;
}

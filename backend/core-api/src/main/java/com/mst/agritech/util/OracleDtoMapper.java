package com.mst.agritech.util;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.oracle.*;

import java.time.format.DateTimeFormatter;

public final class OracleDtoMapper {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATETIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private OracleDtoMapper() {}

    public static InvoiceHeaderDto toHeaderDto(InvoiceHeader h) {
        return InvoiceHeaderDto.builder()
                .invoiceId(h.getInvoiceId())
                .invoiceNumber(h.getInvoiceNumber())
                .businessUnit(h.getBusinessUnit())
                .legalEntity(h.getLegalEntity())
                .invoiceType(h.getInvoiceType())
                .invoiceDate(h.getInvoiceDate() != null ? h.getInvoiceDate().format(DATE) : null)
                .accountingDate(h.getAccountingDate() != null ? h.getAccountingDate().format(DATE) : null)
                .invoiceAmount(h.getInvoiceAmount())
                .invoiceCurrencyCode(h.getInvoiceCurrencyCode())
                .paymentStatusFlag(h.getPaymentStatusFlag())
                .validationStatus(h.getValidationStatus())
                .supplierNumber(h.getSupplierNumber())
                .supplierSite(h.getSupplierSite())
                .billToCustomerName(h.getBillToCustomerName())
                .purchaseOrder(h.getPurchaseOrderNumber())
                .paymentTerms(h.getPaymentTerms())
                .dueDate(h.getDueDate() != null ? h.getDueDate().format(DATE) : null)
                .description(h.getDescription())
                .conversionRate(h.getConversionRate())
                .createdBy(h.getCreatedBy())
                .creationDate(h.getCreationDate() != null ? h.getCreationDate().format(DATETIME) : null)
                .lastUpdateDate(h.getLastUpdateDate() != null ? h.getLastUpdateDate().format(DATETIME) : null)
                .lastUpdatedBy(h.getLastUpdatedBy())
                .build();
    }

    public static InvoiceLineDto toLineDto(InvoiceLine line) {
        return InvoiceLineDto.builder()
                .invoiceLineId(line.getInvoiceLineId())
                .invoiceId(line.getInvoiceHeader().getInvoiceId())
                .lineNumber(line.getLineNumber())
                .lineTypeLookupCode(line.getLineTypeLookupCode())
                .amount(line.getAmount())
                .quantityInvoiced(line.getQuantityInvoiced())
                .unitPrice(line.getUnitPrice())
                .itemDescription(line.getItemDescription())
                .uomCode(line.getUomCode())
                .taxClassificationCode(line.getTaxClassificationCode())
                .lineSource(line.getLineSource())
                .createdBy(line.getCreatedBy())
                .creationDate(line.getCreationDate() != null ? line.getCreationDate().format(DATETIME) : null)
                .build();
    }

    public static InvoiceDistributionDto toDistributionDto(InvoiceDistribution dist) {
        return InvoiceDistributionDto.builder()
                .invoiceDistributionId(dist.getInvoiceDistributionId())
                .invoiceLineId(dist.getInvoiceLine().getInvoiceLineId())
                .distributionLineNumber(dist.getDistributionLineNumber())
                .amount(dist.getAmount())
                .distCodeCombinationId(dist.getDistCodeCombinationId())
                .accountingDate(dist.getAccountingDate() != null ? dist.getAccountingDate().format(DATE) : null)
                .description(dist.getDescription())
                .distributionClass(dist.getDistributionClass())
                .createdBy(dist.getCreatedBy())
                .creationDate(dist.getCreationDate() != null ? dist.getCreationDate().format(DATETIME) : null)
                .build();
    }

    public static PaymentDto toPaymentDto(Payment p) {
        return PaymentDto.builder()
                .paymentId(p.getId())
                .paymentNumber(p.getTransactionId() != null ? p.getTransactionId() : "PAY-" + p.getId())
                .orderNumber(p.getOrder().getReference())
                .paymentAmount(p.getAmount())
                .paymentCurrencyCode(p.getCurrency().getCode())
                .paymentMethodCode(p.getGateway())
                .paymentStatus(p.getStatus())
                .paymentDate(p.getCreatedAt().format(DATETIME))
                .lastUpdateDate(p.getUpdatedAt().format(DATETIME))
                .build();
    }

    public static ShipmentDto toShipmentDto(Shipment s) {
        String origin = s.getOrder().getFarmer().getProvince() != null
                ? s.getOrder().getFarmer().getProvince() + ", "
                    + s.getOrder().getFarmer().getCountry().getIsoCode()
                : s.getOrder().getFarmer().getCountry().getName();
        String destination = s.getOrder().getBuyer().getCountry().getName();

        return ShipmentDto.builder()
                .shipmentId(s.getId())
                .shipmentNumber(s.getTrackingNumber())
                .orderNumber(s.getOrder().getReference())
                .carrierName(s.getLogisticsCompany() != null ? s.getLogisticsCompany().getName() : null)
                .shipmentMode(s.getShipmentType())
                .originLocation(origin)
                .destinationLocation(destination)
                .shipmentStatus(s.getStatus())
                .estimatedArrivalDate(s.getEstimatedArrival() != null
                        ? s.getEstimatedArrival().format(DATETIME) : null)
                .minTemperatureCelsius(s.getMinTempCelsius() != null
                        ? s.getMinTempCelsius().toPlainString() : null)
                .maxTemperatureCelsius(s.getMaxTempCelsius() != null
                        ? s.getMaxTempCelsius().toPlainString() : null)
                .creationDate(s.getCreatedAt().format(DATETIME))
                .build();
    }

    public static OrderLineDto toOrderLineDto(OrderItem item, int lineNumber) {
        return OrderLineDto.builder()
                .orderLineId(item.getId())
                .orderNumber(item.getOrder().getReference())
                .lineNumber(lineNumber)
                .itemDescription(item.getProduct().getName())
                .orderedQuantity(item.getQuantity())
                .quantityUom(item.getQuantityUnit())
                .unitSellingPrice(item.getUnitPrice())
                .lineAmount(item.getLineTotal())
                .lineStatus("OPEN")
                .build();
    }
}

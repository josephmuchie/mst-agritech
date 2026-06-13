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
@Schema(description = "Oracle Fusion invoice header resource")
public class InvoiceHeaderDto {

    @JsonProperty("InvoiceId")
    @Schema(description = "Oracle invoice identifier", example = "100001")
    private String invoiceId;

    @JsonProperty("InvoiceNumber")
    @Schema(description = "Business invoice number", example = "INV-2026-001")
    private String invoiceNumber;

    @JsonProperty("BusinessUnit")
    @Schema(example = "MST BU ZW")
    private String businessUnit;

    @JsonProperty("LegalEntity")
    @Schema(example = "MST Agritech ZW Ltd")
    private String legalEntity;

    @JsonProperty("InvoiceType")
    @Schema(example = "Standard")
    private String invoiceType;

    @JsonProperty("InvoiceDate")
    @Schema(description = "Invoice date (YYYY-MM-DD)", example = "2026-06-01")
    private String invoiceDate;

    @JsonProperty("AccountingDate")
    @Schema(example = "2026-06-01")
    private String accountingDate;

    @JsonProperty("InvoiceAmount")
    @Schema(example = "4200.00")
    private BigDecimal invoiceAmount;

    @JsonProperty("InvoiceCurrencyCode")
    @Schema(example = "USD")
    private String invoiceCurrencyCode;

    @JsonProperty("PaymentStatusFlag")
    @Schema(description = "Y = paid, N = unpaid", example = "Y")
    private String paymentStatusFlag;

    @JsonProperty("ValidationStatus")
    @Schema(example = "Validated")
    private String validationStatus;

    @JsonProperty("SupplierNumber")
    @Schema(example = "SUP-1001")
    private String supplierNumber;

    @JsonProperty("SupplierSite")
    @Schema(example = "Harare Main")
    private String supplierSite;

    @JsonProperty("BillToCustomerName")
    @Schema(example = "Woolworths SA")
    private String billToCustomerName;

    @JsonProperty("PurchaseOrder")
    @Schema(description = "Linked purchase order / MST order reference", example = "ORD-20260601-001")
    private String purchaseOrder;

    @JsonProperty("PaymentTerms")
    @Schema(example = "Net 30")
    private String paymentTerms;

    @JsonProperty("DueDate")
    @Schema(example = "2026-07-01")
    private String dueDate;

    @JsonProperty("Description")
    @Schema(example = "Fresh roses export invoice")
    private String description;

    @JsonProperty("ConversionRate")
    @Schema(example = "1.00000000")
    private BigDecimal conversionRate;

    @JsonProperty("CreatedBy")
    @Schema(example = "ORACLE_IMPORT")
    private String createdBy;

    @JsonProperty("CreationDate")
    @Schema(example = "2026-06-01T08:00:00")
    private String creationDate;

    @JsonProperty("LastUpdateDate")
    @Schema(example = "2026-06-01T08:00:00")
    private String lastUpdateDate;

    @JsonProperty("LastUpdatedBy")
    @Schema(example = "ORACLE_IMPORT")
    private String lastUpdatedBy;
}

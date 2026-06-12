package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExternalInvoiceResponse {
    private Long id;
    private Long integrationConfigId;
    private String externalId;
    private String invoiceNumber;
    private String buyerName;
    private String orderReference;
    private BigDecimal amount;
    private String currencyCode;
    private String status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDateTime syncedAt;
}

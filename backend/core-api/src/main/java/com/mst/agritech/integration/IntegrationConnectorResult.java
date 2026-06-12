package com.mst.agritech.integration;

import com.mst.agritech.domain.entity.ExternalInvoice;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class IntegrationConnectorResult {
    private boolean success;
    private int recordsProcessed;
    private String message;
    private List<ExternalInvoice> invoices;
}

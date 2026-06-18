package com.mst.agritech.dto.procurement;

import lombok.Data;

/** Partial update of procurement service toggles + supplier identity. Null fields are left unchanged. */
@Data
public class UpdateProcurementSettingsRequest {
    private Boolean restEnabled;
    private Boolean cxmlEnabled;
    private Boolean ociEnabled;
    private Boolean soapEnabled;
    private String supplierDomain;
    private String supplierIdentity;
}

package com.mst.agritech.dto.procurement;

import lombok.Builder;
import lombok.Data;

/** Live procurement-integration configuration + resolved endpoint URLs for the documentation UI. */
@Data
@Builder
public class ProcurementSettingsResponse {
    private boolean restEnabled;
    private boolean cxmlEnabled;
    private boolean ociEnabled;
    private boolean soapEnabled;

    private String supplierDomain;
    private String supplierIdentity;

    private String publicApiUrl;
    private String restCatalogUrl;
    private String restProductUrl;
    private String cxmlSetupUrl;
    private String ociStartUrl;
    private String soapEndpointUrl;
    private String wsdlUrl;
    private String marketplaceLandingUrl;
}

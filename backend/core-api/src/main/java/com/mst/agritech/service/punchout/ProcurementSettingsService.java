package com.mst.agritech.service.punchout;

import com.mst.agritech.domain.entity.AppSetting;
import com.mst.agritech.dto.procurement.ProcurementSettingsResponse;
import com.mst.agritech.dto.procurement.UpdateProcurementSettingsRequest;
import com.mst.agritech.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads/writes procurement-integration toggles and supplier identity from the
 * key-value {@code app_settings} table (prefix {@code procurement.}), and resolves
 * the live endpoint URLs shown in the admin documentation UI.
 */
@Service
@RequiredArgsConstructor
public class ProcurementSettingsService {

    private final AppSettingRepository appSettingRepository;

    @Value("${app.public-api-url}")
    private String publicApiUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public boolean isRestEnabled() { return flag("procurement.rest.enabled", true); }
    public boolean isCxmlEnabled() { return flag("procurement.cxml.enabled", true); }
    public boolean isOciEnabled() { return flag("procurement.oci.enabled", true); }
    public boolean isSoapEnabled() { return flag("procurement.soap.enabled", true); }

    public String supplierDomain() { return value("procurement.supplier.domain", "NetworkID"); }
    public String supplierIdentity() { return value("procurement.supplier.identity", "MST-AGRITECH"); }

    @Transactional(readOnly = true)
    public ProcurementSettingsResponse getSettings() {
        String base = publicApiUrl.replaceAll("/+$", "");
        return ProcurementSettingsResponse.builder()
                .restEnabled(isRestEnabled())
                .cxmlEnabled(isCxmlEnabled())
                .ociEnabled(isOciEnabled())
                .soapEnabled(isSoapEnabled())
                .supplierDomain(supplierDomain())
                .supplierIdentity(supplierIdentity())
                .publicApiUrl(base)
                .restCatalogUrl(base + "/api/v1/marketplace/products")
                .restProductUrl(base + "/api/v1/marketplace/products/{id}")
                .cxmlSetupUrl(base + "/api/v1/punchout/setup")
                .ociStartUrl(base + "/api/v1/oci/start")
                .soapEndpointUrl(base + "/soap")
                .wsdlUrl(base + "/soap/catalog.wsdl")
                .marketplaceLandingUrl(frontendUrl.replaceAll("/+$", "") + "/punchout")
                .build();
    }

    @Transactional
    public ProcurementSettingsResponse update(UpdateProcurementSettingsRequest request) {
        if (request.getRestEnabled() != null) upsert("procurement.rest.enabled", request.getRestEnabled().toString());
        if (request.getCxmlEnabled() != null) upsert("procurement.cxml.enabled", request.getCxmlEnabled().toString());
        if (request.getOciEnabled() != null) upsert("procurement.oci.enabled", request.getOciEnabled().toString());
        if (request.getSoapEnabled() != null) upsert("procurement.soap.enabled", request.getSoapEnabled().toString());
        if (request.getSupplierDomain() != null && !request.getSupplierDomain().isBlank())
            upsert("procurement.supplier.domain", request.getSupplierDomain().trim());
        if (request.getSupplierIdentity() != null && !request.getSupplierIdentity().isBlank())
            upsert("procurement.supplier.identity", request.getSupplierIdentity().trim());
        return getSettings();
    }

    private boolean flag(String key, boolean defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                .orElse(defaultValue);
    }

    private String value(String key, String defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(AppSetting::getSettingValue)
                .filter(v -> v != null && !v.isBlank())
                .orElse(defaultValue);
    }

    private void upsert(String key, String value) {
        AppSetting setting = appSettingRepository.findBySettingKey(key)
                .orElse(AppSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        appSettingRepository.save(setting);
    }
}

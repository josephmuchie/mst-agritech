package com.mst.agritech.service;

import com.mst.agritech.domain.entity.AppSetting;
import com.mst.agritech.dto.request.UpdateAppSettingsRequest;
import com.mst.agritech.dto.response.AppSettingsResponse;
import com.mst.agritech.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppSettingsService {

    private final AppSettingRepository appSettingRepository;

    private static final String PREFIX = "platform.";

    @Transactional(readOnly = true)
    public AppSettingsResponse getGeneralSettings() {
        Map<String, String> raw = new LinkedHashMap<>();
        appSettingRepository.findBySettingKeyStartingWith(PREFIX).forEach(s ->
                raw.put(s.getSettingKey(), s.getSettingValue()));

        return AppSettingsResponse.builder()
                .platformName(getValue("platform.name", "MST Agritech"))
                .defaultCurrency(getValue("platform.default_currency", "USD"))
                .supportEmail(getValue("platform.support_email", "support@mstagritech.co.zw"))
                .maxOrderValueUsd(getValue("platform.max_order_value_usd", "500000"))
                .maintenanceMode("true".equalsIgnoreCase(getValue("platform.maintenance_mode", "false")))
                .raw(raw)
                .build();
    }

    @Transactional
    public AppSettingsResponse updateGeneralSettings(UpdateAppSettingsRequest request) {
        if (request.getPlatformName() != null) {
            upsert("platform.name", request.getPlatformName());
        }
        if (request.getDefaultCurrency() != null) {
            upsert("platform.default_currency", request.getDefaultCurrency());
        }
        if (request.getSupportEmail() != null) {
            upsert("platform.support_email", request.getSupportEmail());
        }
        if (request.getMaxOrderValueUsd() != null) {
            upsert("platform.max_order_value_usd", request.getMaxOrderValueUsd());
        }
        if (request.getMaintenanceMode() != null) {
            upsert("platform.maintenance_mode", request.getMaintenanceMode().toString());
        }
        return getGeneralSettings();
    }

    private String getValue(String key, String defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(AppSetting::getSettingValue)
                .orElse(defaultValue);
    }

    private void upsert(String key, String value) {
        AppSetting setting = appSettingRepository.findBySettingKey(key)
                .orElse(AppSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        appSettingRepository.save(setting);
    }
}

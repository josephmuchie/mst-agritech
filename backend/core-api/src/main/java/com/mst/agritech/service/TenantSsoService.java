package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Tenant;
import com.mst.agritech.domain.entity.TenantSsoConfig;
import com.mst.agritech.domain.entity.User;
import com.mst.agritech.dto.request.UpdateTenantSsoConfigRequest;
import com.mst.agritech.dto.response.TenantSsoConfigResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.TenantRepository;
import com.mst.agritech.repository.TenantSsoConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSsoService {

    private final TenantSsoConfigRepository ssoConfigRepository;
    private final TenantRepository tenantRepository;
    private final CurrentUserService currentUserService;

    public TenantSsoConfigResponse getConfigForCurrentUser() {
        Tenant tenant = resolveAdminTenant();
        TenantSsoConfig config = ssoConfigRepository.findByTenantId(tenant.getId())
                .orElseGet(() -> createDefaultConfig(tenant));
        return toResponse(tenant, config);
    }

    @Transactional
    public TenantSsoConfigResponse updateConfig(UpdateTenantSsoConfigRequest request) {
        Tenant tenant = resolveAdminTenant();
        if (StringUtils.hasText(request.getEmailDomains())) {
            tenant.setEmailDomains(request.getEmailDomains());
            tenantRepository.save(tenant);
        }

        TenantSsoConfig config = ssoConfigRepository.findByTenantId(tenant.getId())
                .orElseGet(() -> createDefaultConfig(tenant));

        if (request.getEnabled() != null) config.setEnabled(request.getEnabled());
        if (request.getProviderLabel() != null) config.setProviderLabel(request.getProviderLabel());
        if (request.getProviderType() != null) config.setProviderType(request.getProviderType());
        if (request.getIssuerUri() != null) config.setIssuerUri(request.getIssuerUri());
        if (request.getClientId() != null) config.setClientId(request.getClientId());
        if (StringUtils.hasText(request.getClientSecret())) {
            config.setClientSecretEncrypted(request.getClientSecret());
        }
        if (request.getAuthorizationUri() != null) config.setAuthorizationUri(request.getAuthorizationUri());
        if (request.getTokenUri() != null) config.setTokenUri(request.getTokenUri());
        if (request.getUserinfoUri() != null) config.setUserinfoUri(request.getUserinfoUri());
        if (request.getScopes() != null) config.setScopes(request.getScopes());
        if (request.getAutoProvisionUsers() != null) config.setAutoProvisionUsers(request.getAutoProvisionUsers());
        if (request.getAllowPasswordLogin() != null) config.setAllowPasswordLogin(request.getAllowPasswordLogin());
        if (request.getDefaultRoleName() != null) config.setDefaultRoleName(request.getDefaultRoleName());

        return toResponse(tenant, ssoConfigRepository.save(config));
    }

    private Tenant resolveAdminTenant() {
        User user = currentUserService.requireCurrentUser();
        if (user.getTenant() != null) {
            return user.getTenant();
        }
        return tenantRepository.findBySlug("mst-agritech")
                .orElseThrow(() -> new ResourceNotFoundException("Default tenant not found"));
    }

    private TenantSsoConfig createDefaultConfig(Tenant tenant) {
        return ssoConfigRepository.save(TenantSsoConfig.builder()
                .tenant(tenant)
                .enabled(false)
                .providerLabel("Corporate SSO")
                .providerType("OIDC")
                .scopes("openid profile email")
                .autoProvisionUsers(true)
                .allowPasswordLogin(true)
                .defaultRoleName("FARMER")
                .build());
    }

    private TenantSsoConfigResponse toResponse(Tenant tenant, TenantSsoConfig config) {
        return TenantSsoConfigResponse.builder()
                .tenantId(tenant.getId())
                .tenantSlug(tenant.getSlug())
                .tenantName(tenant.getName())
                .enabled(config.isEnabled())
                .providerLabel(config.getProviderLabel())
                .providerType(config.getProviderType())
                .issuerUri(config.getIssuerUri())
                .clientId(config.getClientId())
                .hasClientSecret(StringUtils.hasText(config.getClientSecretEncrypted()))
                .authorizationUri(config.getAuthorizationUri())
                .tokenUri(config.getTokenUri())
                .userinfoUri(config.getUserinfoUri())
                .scopes(config.getScopes())
                .autoProvisionUsers(config.isAutoProvisionUsers())
                .allowPasswordLogin(config.isAllowPasswordLogin())
                .defaultRoleName(config.getDefaultRoleName())
                .emailDomains(tenant.getEmailDomains())
                .build();
    }
}

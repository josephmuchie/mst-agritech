package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.TenantSsoConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantSsoConfigRepository extends JpaRepository<TenantSsoConfig, Long> {
    Optional<TenantSsoConfig> findByTenantId(Long tenantId);
    Optional<TenantSsoConfig> findByTenant_Slug(String tenantSlug);
}

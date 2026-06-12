package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, Long> {
    List<IntegrationConfig> findAllByOrderByDisplayNameAsc();
    Optional<IntegrationConfig> findBySystemType(String systemType);
}

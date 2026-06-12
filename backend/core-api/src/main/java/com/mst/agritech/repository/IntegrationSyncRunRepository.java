package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.IntegrationSyncRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IntegrationSyncRunRepository extends JpaRepository<IntegrationSyncRun, Long> {
    Page<IntegrationSyncRun> findByIntegrationConfigIdOrderByStartedAtDesc(Long configId, Pageable pageable);
}

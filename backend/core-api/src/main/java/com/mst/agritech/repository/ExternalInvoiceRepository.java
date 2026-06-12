package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.ExternalInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExternalInvoiceRepository extends JpaRepository<ExternalInvoice, Long> {
    Page<ExternalInvoice> findByIntegrationConfigId(Long configId, Pageable pageable);
    Optional<ExternalInvoice> findByIntegrationConfigIdAndExternalId(Long configId, String externalId);
}

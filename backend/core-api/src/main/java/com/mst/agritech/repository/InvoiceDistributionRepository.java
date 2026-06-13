package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.InvoiceDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceDistributionRepository extends JpaRepository<InvoiceDistribution, Long> {
    List<InvoiceDistribution> findByInvoiceLineInvoiceLineIdOrderByDistributionLineNumberAsc(String invoiceLineId);
    Optional<InvoiceDistribution> findByInvoiceDistributionId(String invoiceDistributionId);
}

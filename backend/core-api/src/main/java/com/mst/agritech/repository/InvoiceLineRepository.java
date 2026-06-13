package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.InvoiceLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceLineRepository extends JpaRepository<InvoiceLine, Long> {
    List<InvoiceLine> findByInvoiceHeaderInvoiceIdOrderByLineNumberAsc(String invoiceId);
    Optional<InvoiceLine> findByInvoiceLineId(String invoiceLineId);
}

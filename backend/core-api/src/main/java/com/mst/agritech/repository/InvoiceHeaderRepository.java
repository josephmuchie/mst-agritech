package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.InvoiceHeader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceHeaderRepository extends JpaRepository<InvoiceHeader, Long> {
    Optional<InvoiceHeader> findByInvoiceId(String invoiceId);
    Page<InvoiceHeader> findAllByOrderByCreationDateDesc(Pageable pageable);
}

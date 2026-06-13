package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Page<Shipment> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Shipment> findByStatus(String status, Pageable pageable);
    long countByStatusIn(List<String> statuses);
}

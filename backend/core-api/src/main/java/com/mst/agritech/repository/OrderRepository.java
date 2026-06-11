package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByReference(String reference);
    Page<Order> findByFarmerId(Long farmerId, Pageable pageable);
    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);
    Page<Order> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal sumDeliveredRevenue();
}

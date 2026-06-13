package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findAllByOrderByRecordedAtDesc();
    Optional<MarketPrice> findFirstByProductIdOrderByRecordedAtDesc(Long productId);
}

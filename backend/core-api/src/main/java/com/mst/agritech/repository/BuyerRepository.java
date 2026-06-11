package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Buyer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    Optional<Buyer> findByUserId(Long userId);
    Page<Buyer> findByCountryId(Long countryId, Pageable pageable);
}

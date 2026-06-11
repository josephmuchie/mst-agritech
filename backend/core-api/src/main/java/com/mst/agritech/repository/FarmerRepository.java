package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Farmer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByUserId(Long userId);
    Page<Farmer> findByCountryId(Long countryId, Pageable pageable);
    Page<Farmer> findByVerifiedTrue(Pageable pageable);
    long countByVerifiedTrue();
}

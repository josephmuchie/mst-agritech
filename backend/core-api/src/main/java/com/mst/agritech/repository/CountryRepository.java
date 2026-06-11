package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByIsoCode(String isoCode);
    List<Country> findByActiveTrue();
}

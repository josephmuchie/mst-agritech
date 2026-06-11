package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CurrencyRepository extends JpaRepository<Currency, Long> {
    List<Currency> findByActiveTrue();
}

package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findByActiveTrue();
    Optional<ProductCategory> findByNameIgnoreCase(String name);
}

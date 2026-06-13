package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.LogisticsCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogisticsCompanyRepository extends JpaRepository<LogisticsCompany, Long> {
    List<LogisticsCompany> findAllByOrderByNameAsc();
}

package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.ReportDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportDefinitionRepository extends JpaRepository<ReportDefinition, Long> {
    List<ReportDefinition> findByActiveTrueOrderByCategoryAscTitleAsc();
}

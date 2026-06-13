package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.DataImportJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataImportJobRepository extends JpaRepository<DataImportJob, Long> {
    Page<DataImportJob> findAllByOrderByStartedAtDesc(Pageable pageable);
}

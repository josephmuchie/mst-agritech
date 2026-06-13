package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.HarvestCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HarvestCalendarRepository extends JpaRepository<HarvestCalendar, Long> {
    List<HarvestCalendar> findByProductId(Long productId);
}

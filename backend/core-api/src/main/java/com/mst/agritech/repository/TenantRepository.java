package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySlug(String slug);

    @Query("SELECT t FROM Tenant t WHERE t.active = true AND LOWER(t.emailDomains) LIKE LOWER(CONCAT('%', :domain, '%'))")
    List<Tenant> findByEmailDomain(@Param("domain") String domain);
}

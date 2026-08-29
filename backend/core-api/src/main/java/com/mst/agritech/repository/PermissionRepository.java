package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByResourceAndAction(String resource, String action);
}

package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.SsoAuthState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SsoAuthStateRepository extends JpaRepository<SsoAuthState, String> {
}

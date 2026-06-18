package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.PunchoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PunchoutSessionRepository extends JpaRepository<PunchoutSession, Long> {
    Optional<PunchoutSession> findBySessionToken(String sessionToken);
}

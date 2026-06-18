package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.PunchoutCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PunchoutCredentialRepository extends JpaRepository<PunchoutCredential, Long> {
    Optional<PunchoutCredential> findByDomainAndIdentityAndActiveTrue(String domain, String identity);
    Optional<PunchoutCredential> findByIdentityAndActiveTrue(String identity);
    Optional<PunchoutCredential> findByDomainAndIdentity(String domain, String identity);
    java.util.List<PunchoutCredential> findAllByOrderByBuyerNameAsc();
}

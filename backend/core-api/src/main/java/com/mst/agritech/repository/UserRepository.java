package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailAndTenantId(String email, Long tenantId);
    Optional<User> findByTenantIdAndSsoSubject(Long tenantId, String ssoSubject);
}
